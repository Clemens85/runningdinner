# RunningDinner Backend - AI Coding Assistant Instructions

## Project Overview

Spring Boot 3.4+ Java 21 application for managing "Running Dinner" events - social dining events where participants visit each other's homes for different meal courses. Uses PostgreSQL with Flyway migrations, event-driven architecture, and integrates with AWS SES/MailJet for email and AWS SQS for geocoding.

## Architecture & Core Concepts

### Domain Model Hierarchy

- **RunningDinner**: Root aggregate containing meals, participants, teams, and settings
  - Identified by `adminId` (admin access) and `selfAdministrationId` (participant self-service)
  - Three types: `CLOSED` (admin-managed) vs `OPEN` (self-registration enabled, but only accessible by secret link) and `PUBLIC` (self-registration enabled, publicly listed)
- **Participant**: Individual registered for a dinner
- **Team**: 2 participants assigned to host a specific meal together
- **Meal**: Course in the dinner (appetizer, main course, dessert)
- **DinnerRoute**: Calculated sequence of which teams visit which hosts for each meal

### Event-Driven Architecture

The application uses synchronous Spring `ApplicationEvent`s to decouple domain logic:

```java
// Publishing events (via EventPublisher)
eventPublisher.notifyNewRunningDinner(runningDinner);
eventPublisher.notifyTeamsArranged(teams, runningDinner);

// Listening to events
@Component
public class TeamsArrangedActivityListener implements ApplicationListener<TeamsArrangedEvent> {
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(TeamsArrangedEvent event) {
    activityService.createActivityForTeamsArranged(event.getTeams(), event.getRunningDinner());
  }
}
```

**Key patterns:**

- Events in `org.runningdinner.event/` trigger side effects (emails, activity logs, geocoding)
- Use `TransactionSynchronization.afterCommit()` to publish events after DB commits
- Listeners often use `Propagation.REQUIRES_NEW` for independent transactions
- See `org.runningdinner.event.publisher.EventPublisher` for all available events

### Multi-Provider Mail System

Handles email via pooled mail providers with priority/fallback/limits:

```java
// Configured in MailConfig - providers checked in priority order
// 1. MailJet (mail.mailjet.*) - daily/monthly limits
// 2. AWS SES (mail.awsses.*) - daily/monthly limits
// 3. SMTP fallback (mail.smtp.*)
// In tests: MailProviderMockInMemory captures all emails
```

**Config pattern:**

- Each provider: `{prefix}.enabled`, `{prefix}.limit.daily/monthly`, `{prefix}.priority`, `{prefix}.fallback`
- See `MailSenderFactory.getConfiguredMailSenders()` for pool initialization
- Production validates at least one provider is configured

### Async Geocoding via AWS SQS

Address geocoding happens asynchronously through queue messaging:

```java
// Request: Backend -> SQS request queue -> External geocoder
@Async
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public CompletableFuture<Void> sendParticipantGeocodingRequestAsync(Participant participant) {
  // Publishes to aws.sqs.geocode.request.url
}

// Response: External geocoder -> SQS response queue -> Backend polls
@Scheduled(fixedDelayString = "${geocode.response.scheduler.delay}")
public void pollGeocodeResponses() {
  // Polls aws.sqs.geocode.response.url
}
```

**Key files:** `GeocodeRequestEventPublisher`, `GeocodeResponseListener`

## Development Workflows

### Running Locally

```bash
# Start with dev profile + demo data
./start-backend.sh
# Or manually:
./mvnw package -DskipTests
java -jar -Dspring.profiles.active=dev,demodinner,webpack target/runningdinner-2.0.0.jar
```

**Profiles:**

- `dev`: CORS enabled, local DB, file-based optimization data
- `demodinner`: Auto-creates sample dinners on startup via `DataInitializationService`
- `junit`: Test mode with mocked mail/queue providers
- `prod`: Production settings (AWS resources, strict validation)

### Database Management

Uses Flyway for versioned migrations in `src/main/resources/db/migration/`:

```bash
# Local PostgreSQL connection (defaults in pom.xml):
# jdbc:postgresql://localhost:5432/runningdinner
# username: postgres / password: root
# schema/user created by Flyway: runningdinner/runningdinner

# Run migrations manually:
./mvnw flyway:migrate

# Clean database (WARNING: drops all data):
./mvnw flyway:clean
```

**Migration naming:** `V{major}.{minor}__{Description}.sql` (e.g., `V2.5__AddZipRestrictions.sql`)

### Testing Patterns

Tests use `@ApplicationTest` meta-annotation for consistent configuration:

```java
@ApplicationTest  // Combines @SpringBootTest + @ActiveProfiles("dev", "junit") + scheduler/queue disables
public class MyServiceTest {

  @Autowired
  private TestHelperService testHelperService;  // Creates test data

  @Autowired
  private MailProviderMockInMemory mailProvider;  // Captures sent emails

  @Test
  public void testFeature() {
    RunningDinner dinner = testHelperService.createClosedRunningDinnerWithParticipants(
      LocalDate.now().plusDays(7), 18);
    // Test assertions...
  }
}
```

**Test utilities:**

- `TestHelperService`: Create dinners/participants/teams
- `MailProviderMockInMemory`: Inspect sent emails via `getSentMails()`
- `QueueProviderMockInMemory`: Verify queue messages via `getMessageRequests()`

### Docker Deployment

```bash
# Build uses Spring Boot layered JAR extraction
cd infrastructure/deployment/docker
./build-docker-image.sh
# Uses Dockerfile with Amazon Corretto 21 Alpine
# Layers: dependencies -> spring-boot-loader -> application
```

## Code Conventions & Patterns

### Transaction Management

- **Read-only queries:** `@Transactional(readOnly = true)` on services fetching data
- **New transactions:** `Propagation.REQUIRES_NEW` for independent operations (logging, emails)
- **No transaction:** `Propagation.NOT_SUPPORTED` for async queue operations

### Service Layer Organization

Package structure mirrors domain concepts:

```
org.runningdinner/
├── core/            # Core domain entities and algorithms (technology-agnostic)
├── admin/           # RunningDinner CRUD, admin operations
├── participant/     # Participant/Team management
├── mail/            # Email sending, templates, provider pooling
├── dinnerroute/     # Route calculation, optimization
├── geocoder/        # Async geocoding via SQS
├── event/           # Domain events + listeners
├── frontend/        # Public registration endpoints
├── selfservice/     # Participant self-admin features
└── wizard/          # Step-by-step dinner creation
```

### Validation & Security

- **XSS Protection:** `AntiSamyFilter` on `/rest/*` endpoints sanitizes HTML inputs
- **Admin ID Validation:** `@ValidateAdminId` annotation ensures valid admin access
- **DTOs:** Transfer Objects (ending in `TO`) for API contracts, separate from JPA entities

### Scheduled Tasks

Uses ShedLock to prevent concurrent execution in clustered environments:

```java
@Scheduled(fixedDelay = 900000)  // 15 minutes
@SchedulerLock(name = "deliverFeedbackMails", lockAtMostFor = "PT2M")
public void deliverScheduledFeedbackMails() { ... }
```

**Control via properties:** `{feature}.scheduler.enabled=true/false`

## Key Configuration Properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/runningdinner
spring.jpa.hibernate.ddl-auto=none  # Flyway handles schema

# Mail providers (at least one required in prod)
mail.mailjet.enabled=true
mail.awsses.enabled=true
mail.smtp.enabled=false

# Async geocoding queues
aws.sqs.geocode.request.url=<SQS-queue-URL>
aws.sqs.geocode.response.url=<SQS-queue-URL>

# Scheduler toggles
delete.runninginnder.instances.scheduler.enabled=true
deliver.feedback.mail.scheduler.enabled=true

# Local dev: Write emails to files instead of sending
# Pass: -DMailMockDir=/path/to/folder
```

## Common Pitfalls & Solutions

1. **Event listeners not executing:** Check transaction boundaries - use `TransactionSynchronization.afterCommit()` if event needs committed data
2. **Mail not sending in tests:** Verify `@ApplicationTest` is used (enables `MailProviderMockInMemory`)
3. **Geocoding not triggering:** Ensure queues configured in properties and scheduler enabled
4. **UTF-8 encoding errors:** Startup validates `file.encoding=UTF-8` system property is set
5. **Flyway conflicts:** Local dev uses same credentials for schema creation - don't run migrations concurrently

## References

- **Main entry point:** `ApplicationConfig.java` (Spring Boot application)
- **Event system:** `EventPublisher` + `org.runningdinner.event.listener/` package
- **Mail architecture:** `MailSenderFactory`, `MailService`, `MailConfig`
- **Test base:** `ApplicationTest` annotation, `TestHelperService`
- **Example REST controller:** `org.runningdinner.admin.rest.RunningDinnerServiceRest`
