# Participant Portal - Concept Document

## Executive Summary

This document outlines the concept for a new **Participant Portal** feature that consolidates all participant self-service functionalities into a unified, browser-based area. The portal will be accessible via secret URLs and will provide participants with access to their registered events, messages, and various self-service functions.

## Current State Analysis

### Existing Self-Service Features
Currently, the following participant self-service features exist, each accessible via unique secret URLs:

1. **Dinner Route View** (`/self/{selfAdminId}/dinnerroute/{participantId}/{teamId}`)
2. **Team Host Management** (`/self/{selfAdminId}/teamhost/{participantId}/{teamId}`)
3. **Team Partner Wish Management** (`/self/{selfAdminId}/teampartnerwish/{participantId}`)

### Key Components
- **Backend**: `SelfAdminService.java`, `SelfAdminServiceRest.java`
- **Frontend**: React components in `webapp/src/self/` directory
- **State Management**: Redux store in `shared/src/self/redux/`
- **Authentication**: UUID-based (`selfAdminId` + `participantId`)

### Current Limitations
- No centralized entry point for participants
- Each feature requires separate URL access
- No message history visibility for participants
- No persistent session management
- Manual URL distribution required

## Proposed Solution

### 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Participant Portal                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │  My Events      │  │  Messages        │  │  Self-Service│ │
│  │  Dashboard      │  │  History         │  │  Functions  │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Browser Local Storage / IndexedDB             │   │
│  │  - Event Credentials (selfAdminId + participantId)   │   │
│  │  - Cached Event Data                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Data Model Extensions

#### 2.1 New Frontend Types (TypeScript)

```typescript
// Stored in Browser Local Storage / IndexedDB
interface ParticipantPortalCredentials {
  participantId: string;        // UUID
  selfAdminId: string;          // UUID
  email: string;                // Participant email
  registeredAt: Date;           // Registration timestamp
  publicDinnerId?: string;      // For public events
  teamId?: string;              // UUID, if assigned to team
}

interface ParticipantEventEntry {
  credentials: ParticipantPortalCredentials;
  eventTitle: string;
  eventDate: LocalDate;
  lastAccessedAt: Date;
}

interface ParticipantMessageTO {
  id: string;                   // UUID
  subject: string;
  content: string;              // HTML formatted
  sentAt: LocalDateTime;
  messageType: MessageType;     // PARTICIPANT, TEAM, DINNER_ROUTE, etc.
  senderName?: string;          // Organizer name
  senderEmail: string;          // Reply-to email
  read: boolean;                // Client-side tracking
}

interface ParticipantPortalData {
  participant: ParticipantTO;
  runningDinner: ParticipantRunningDinnerTO;  // Limited view
  team?: TeamTO;
  messages: ParticipantMessageTO[];
  availableFeatures: ParticipantFeatureFlags;
}

interface ParticipantFeatureFlags {
  canViewDinnerRoute: boolean;
  canChangeTeamHost: boolean;
  canManageTeamPartnerWish: boolean;
  canViewMessages: boolean;
}

interface ParticipantRunningDinnerTO {
  title: string;
  date: LocalDate;
  city: string;
  meals: MealTO[];
  organizerName?: string;
  publicDinnerId?: string;
}
```

#### 2.2 Backend Extensions

##### New REST Endpoints

```java
@RestController
@RequestMapping(value = "/rest/participant-portal/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class ParticipantPortalServiceRest {
    
    /**
     * Get complete portal data for a participant including events and messages
     * GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/data
     */
    public ParticipantPortalDataTO getParticipantPortalData(
        @PathVariable UUID selfAdminId,
        @PathVariable UUID participantId
    );
    
    /**
     * Get message history for a participant (filtered to only their messages)
     * GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/messages
     */
    public List<ParticipantMessageTO> getParticipantMessages(
        @PathVariable UUID selfAdminId,
        @PathVariable UUID participantId,
        @RequestParam(required = false) LocalDateTime since
    );
    
    /**
     * Mark a message as read (client-side tracking could also be used)
     * PUT /rest/participant-portal/v1/{selfAdminId}/{participantId}/messages/{messageId}/read
     */
    public void markMessageAsRead(
        @PathVariable UUID selfAdminId,
        @PathVariable UUID participantId,
        @PathVariable UUID messageId
    );
    
    /**
     * Request access link via email (for lost credentials)
     * POST /rest/participant-portal/v1/request-access
     */
    public void requestAccessLink(
        @RequestBody AccessLinkRequest request  // Contains: email, publicDinnerId or eventIdentifier
    );
    
    /**
     * Get list of all registered events for this browser/device
     * POST /rest/participant-portal/v1/my-events
     */
    public List<ParticipantEventSummaryTO> getMyEvents(
        @RequestBody List<ParticipantPortalCredentials> credentials
    );
}
```

##### New Service Layer

```java
@Service
public class ParticipantPortalService {
    
    @Autowired
    private MessageTaskRepository messageTaskRepository;
    
    @Autowired
    private ParticipantService participantService;
    
    @Autowired
    private RunningDinnerService runningDinnerService;
    
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private MailService mailService;
    
    /**
     * Retrieve all messages sent to a specific participant
     */
    @Transactional(readOnly = true)
    public List<ParticipantMessageTO> findMessagesForParticipant(
        UUID selfAdminId, 
        UUID participantId,
        LocalDateTime since
    ) {
        RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdminId);
        Participant participant = participantService.findParticipantById(runningDinner.getAdminId(), participantId);
        
        String participantEmail = participant.getEmail().toLowerCase();
        
        // Find all message tasks where recipient matches participant email
        // Filter by end-user message types only (no admin messages)
        List<MessageTask> messageTasks = messageTaskRepository
            .findByRecipientEmailAndMessageTypeIn(
                participantEmail, 
                getEndUserMessageTypes(),
                since
            );
        
        return messageTasks.stream()
            .map(this::toParticipantMessageTO)
            .sorted(Comparator.comparing(ParticipantMessageTO::getSentAt).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * Send access link via email to participant
     */
    @Transactional
    public void sendAccessLink(String email, String eventIdentifier) {
        // Find participant by email and event
        Participant participant = findParticipantByEmailAndEvent(email, eventIdentifier);
        RunningDinner runningDinner = runningDinnerService.findRunningDinnerById(participant.getAdminId());
        
        // Generate portal access URL
        String portalUrl = buildPortalUrl(
            runningDinner.getSelfAdministrationId(),
            participant.getId()
        );
        
        // Send email with access link
        sendPortalAccessEmail(participant, runningDinner, portalUrl);
    }
    
    @Transactional(readOnly = true)
    public ParticipantPortalDataTO getPortalData(UUID selfAdminId, UUID participantId) {
        RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdminId);
        Participant participant = participantService.findParticipantById(runningDinner.getAdminId(), participantId);
        
        ParticipantPortalDataTO result = new ParticipantPortalDataTO();
        result.setParticipant(new ParticipantTO(participant));
        result.setRunningDinner(toParticipantRunningDinnerTO(runningDinner));
        
        // Load team if assigned
        if (participant.getTeamId() != null) {
            Team team = teamService.findTeamById(runningDinner.getAdminId(), participant.getTeamId());
            result.setTeam(new TeamTO(team));
        }
        
        // Load messages
        result.setMessages(findMessagesForParticipant(selfAdminId, participantId, null));
        
        // Set feature flags
        result.setAvailableFeatures(determineAvailableFeatures(participant, runningDinner));
        
        return result;
    }
    
    private List<MessageType> getEndUserMessageTypes() {
        return Arrays.asList(
            MessageType.PARTICIPANT,
            MessageType.TEAM,
            MessageType.DINNER_ROUTE,
            MessageType.TEAM_HOST_CHANGE
        );
    }
}
```

##### New Repository Method

```java
public interface MessageTaskRepository extends RunningDinnerRelatedRepository<MessageTask> {
    
    /**
     * Find all message tasks sent to a specific recipient email address
     * Filter by message types that are relevant to participants
     */
    @Query("""
        SELECT mt FROM MessageTask mt 
        WHERE LOWER(mt.recipientEmail) = LOWER(:recipientEmail)
        AND mt.parentJob.messageType IN :messageTypes
        AND (:since IS NULL OR mt.sendingStartTime >= :since)
        AND mt.sendingStatus = 'SENDING_FINISHED'
        AND mt.sendingResult.delieveryFailed = false
        ORDER BY mt.sendingStartTime DESC
    """)
    List<MessageTask> findByRecipientEmailAndMessageTypeIn(
        @Param("recipientEmail") String recipientEmail,
        @Param("messageTypes") Collection<MessageType> messageTypes,
        @Param("since") LocalDateTime since
    );
}
```

### 3. Frontend Implementation

#### 3.1 Route Structure

```
/participant-portal                           → Landing/Login page
  ├─ /access?token={token}                    → Access via email link
  ├─ /{selfAdminId}/{participantId}           → Main portal dashboard
  │   ├─ /events                               → My registered events
  │   ├─ /messages                             → Message history
  │   ├─ /dinnerroute                          → Dinner route view (existing)
  │   ├─ /teamhost                             → Team host management (existing)
  │   └─ /teampartnerwish                      → Team partner wish (existing)
  └─ /request-access                           → Request access link form
```

#### 3.2 Local Storage Strategy

```typescript
// Storage Service
export class ParticipantPortalStorageService {
    
    private static PORTAL_CREDENTIALS_KEY = 'participant_portal_credentials';
    private static MESSAGE_READ_STATUS_KEY = 'message_read_status';
    
    /**
     * Store participant credentials when accessing portal
     */
    static saveParticipantCredentials(credentials: ParticipantPortalCredentials): void {
        const existing = this.getAllCredentials();
        
        // Avoid duplicates
        const filtered = existing.filter(
            c => !(c.selfAdminId === credentials.selfAdminId && 
                   c.participantId === credentials.participantId)
        );
        
        filtered.push({
            ...credentials,
            registeredAt: credentials.registeredAt || new Date()
        });
        
        setLocalStorageItem(this.PORTAL_CREDENTIALS_KEY, filtered);
    }
    
    /**
     * Get all stored participant credentials
     */
    static getAllCredentials(): ParticipantPortalCredentials[] {
        return getLocalStorageItem<ParticipantPortalCredentials[]>(
            this.PORTAL_CREDENTIALS_KEY
        ) || [];
    }
    
    /**
     * Remove credentials (e.g., when user manually logs out of an event)
     */
    static removeCredentials(selfAdminId: string, participantId: string): void {
        const existing = this.getAllCredentials();
        const filtered = existing.filter(
            c => !(c.selfAdminId === selfAdminId && c.participantId === participantId)
        );
        setLocalStorageItem(this.PORTAL_CREDENTIALS_KEY, filtered);
    }
    
    /**
     * Track which messages have been read (client-side)
     */
    static markMessageAsRead(messageId: string): void {
        const readMessages = getLocalStorageItem<string[]>(
            this.MESSAGE_READ_STATUS_KEY
        ) || [];
        
        if (!readMessages.includes(messageId)) {
            readMessages.push(messageId);
            setLocalStorageItem(this.MESSAGE_READ_STATUS_KEY, readMessages);
        }
    }
    
    static isMessageRead(messageId: string): boolean {
        const readMessages = getLocalStorageItem<string[]>(
            this.MESSAGE_READ_STATUS_KEY
        ) || [];
        return readMessages.includes(messageId);
    }
}
```

#### 3.3 IndexedDB Strategy (Alternative/Additional)

For better performance and storage capacity, we could use IndexedDB:

```typescript
// IndexedDB Schema
interface ParticipantPortalDB {
    credentials: {
        key: string;  // composite: selfAdminId_participantId
        value: ParticipantPortalCredentials;
    };
    cachedEvents: {
        key: string;  // composite: selfAdminId_participantId
        value: ParticipantPortalData;
        indexes: {
            eventDate: Date;
            lastAccessed: Date;
        };
    };
    messages: {
        key: string;  // messageId
        value: ParticipantMessageTO;
        indexes: {
            participantKey: string;  // composite: selfAdminId_participantId
            sentAt: Date;
            read: boolean;
        };
    };
}

// Usage with idb library (https://github.com/jakearchibald/idb)
import { openDB, DBSchema } from 'idb';

const dbPromise = openDB<ParticipantPortalDB>('participant-portal', 1, {
    upgrade(db) {
        // Create object stores and indexes
    }
});
```

#### 3.4 Key React Components

```typescript
// Main Portal Entry Component
export function ParticipantPortalApp() {
    return (
        <Provider store={participantPortalStore}>
            <ParticipantPortalRouter />
        </Provider>
    );
}

// Portal Dashboard
export function ParticipantPortalDashboard() {
    const { selfAdminId, participantId } = useParams();
    const dispatch = useParticipantPortalDispatch();
    
    const { data: portalData, isLoading } = useParticipantPortalSelector(
        getPortalDataSelector
    );
    
    React.useEffect(() => {
        dispatch(fetchPortalData({ selfAdminId, participantId }));
        
        // Save credentials to local storage on successful access
        if (portalData) {
            ParticipantPortalStorageService.saveParticipantCredentials({
                selfAdminId,
                participantId,
                email: portalData.participant.email,
                registeredAt: new Date(),
                teamId: portalData.team?.id
            });
        }
    }, [dispatch, selfAdminId, participantId]);
    
    if (isLoading) {
        return <ProgressBar showLoadingProgress />;
    }
    
    return (
        <Container>
            <PortalHeader participant={portalData.participant} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <EventDetailsCard runningDinner={portalData.runningDinner} />
                    <MessagesCard messages={portalData.messages} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <QuickActionsCard features={portalData.availableFeatures} />
                </Grid>
            </Grid>
        </Container>
    );
}

// My Events Overview
export function MyEventsPage() {
    const [events, setEvents] = React.useState<ParticipantEventEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const loadEvents = async () => {
            const credentials = ParticipantPortalStorageService.getAllCredentials();
            
            if (credentials.length === 0) {
                setLoading(false);
                return;
            }
            
            try {
                // Fetch current data for all stored events
                const response = await axios.post(
                    BackendConfig.buildUrl('/participant-portal/v1/my-events'),
                    credentials
                );
                setEvents(response.data);
            } catch (error) {
                // Handle error
            } finally {
                setLoading(false);
            }
        };
        
        loadEvents();
    }, []);
    
    return (
        <Container>
            <PageTitle>
                <Trans i18nKey="participant_portal:my_events_title" />
            </PageTitle>
            {events.length === 0 ? (
                <NoEventsPlaceholder />
            ) : (
                <EventsList events={events} />
            )}
            <RequestAccessButton />
        </Container>
    );
}

// Messages View
export function ParticipantMessagesPage() {
    const { selfAdminId, participantId } = useParams();
    const [messages, setMessages] = React.useState<ParticipantMessageTO[]>([]);
    const [selectedMessage, setSelectedMessage] = React.useState<ParticipantMessageTO | null>(null);
    
    React.useEffect(() => {
        const loadMessages = async () => {
            const url = BackendConfig.buildUrl(
                `/participant-portal/v1/${selfAdminId}/${participantId}/messages`
            );
            const response = await axios.get<ParticipantMessageTO[]>(url);
            
            // Merge with local read status
            const messagesWithReadStatus = response.data.map(msg => ({
                ...msg,
                read: ParticipantPortalStorageService.isMessageRead(msg.id)
            }));
            
            setMessages(messagesWithReadStatus);
        };
        
        loadMessages();
    }, [selfAdminId, participantId]);
    
    const handleMessageClick = (message: ParticipantMessageTO) => {
        setSelectedMessage(message);
        ParticipantPortalStorageService.markMessageAsRead(message.id);
        // Update local state
        setMessages(prev => 
            prev.map(m => m.id === message.id ? { ...m, read: true } : m)
        );
    };
    
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <MessageList 
                    messages={messages}
                    onMessageClick={handleMessageClick}
                    selectedMessageId={selectedMessage?.id}
                />
            </Grid>
            <Grid item xs={12} md={8}>
                {selectedMessage ? (
                    <MessageDetail message={selectedMessage} />
                ) : (
                    <SelectMessagePlaceholder />
                )}
            </Grid>
        </Grid>
    );
}

// Request Access Link
export function RequestAccessLinkPage() {
    const [email, setEmail] = React.useState('');
    const [eventIdentifier, setEventIdentifier] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await axios.post(
                BackendConfig.buildUrl('/participant-portal/v1/request-access'),
                { email, eventIdentifier }
            );
            setSubmitted(true);
        } catch (error) {
            // Handle error
        }
    };
    
    if (submitted) {
        return (
            <Alert severity="success">
                <Trans i18nKey="participant_portal:access_link_sent" />
            </Alert>
        );
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <TextField
                label={<Trans i18nKey="common:email" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <TextField
                label={<Trans i18nKey="participant_portal:event_identifier_hint" />}
                value={eventIdentifier}
                onChange={(e) => setEventIdentifier(e.target.value)}
                helperText={<Trans i18nKey="participant_portal:event_identifier_help" />}
            />
            <PrimaryButton type="submit">
                <Trans i18nKey="participant_portal:request_access_button" />
            </PrimaryButton>
        </form>
    );
}
```

### 4. Integration with Public Event Registration

When a participant registers for a public event, automatically store their credentials:

```typescript
// In PublicDinnerEventRegistrationForm.tsx
const handleRegistrationSuccess = (response: RegistrationResponse) => {
    const { participantId, selfAdminId } = response;
    
    // Store credentials for portal access
    ParticipantPortalStorageService.saveParticipantCredentials({
        participantId,
        selfAdminId,
        email: formData.email,
        registeredAt: new Date(),
        publicDinnerId: publicSettings.publicDinnerId
    });
    
    // Existing logic...
    setPublicEventRegistrationInLocalStorage(publicSettings.publicDinnerId, registrationData);
    navigateToRegistrationFinished();
};
```

### 5. Email Template for Access Link

New email template needed:

```java
@Component
public class ParticipantPortalAccessLinkMessageFormatter {
    
    public String formatAccessLinkMessage(
        RunningDinner runningDinner,
        Participant participant,
        String portalUrl
    ) {
        Map<String, Object> model = new HashMap<>();
        model.put("participant", participant);
        model.put("runningDinner", runningDinner);
        model.put("portalUrl", portalUrl);
        model.put("validUntil", calculateValidUntil(runningDinner));
        
        return templateService.formatMessage(
            "participant_portal_access_link",
            model,
            participant.getLanguageCode()
        );
    }
}
```

Email content (HTML template):

```html
<h2>Zugang zu Ihrem Teilnehmer-Portal</h2>

<p>Hallo {participantFirstName},</p>

<p>hier ist Ihr persönlicher Zugang zum Teilnehmer-Portal für das Event "{runningDinnerTitle}":</p>

<a href="{portalUrl}" style="...">Zum Teilnehmer-Portal</a>

<p>In Ihrem Portal können Sie:</p>
<ul>
  <li>Ihre Dinner-Route einsehen</li>
  <li>Alle gesendeten Nachrichten des Organisators abrufen</li>
  <li>Teamdaten verwalten</li>
  <li>Team-Partner-Wünsche bearbeiten</li>
</ul>

<p><strong>Wichtig:</strong> Dieser Link ist vertraulich und nur für Sie bestimmt. 
Bitte geben Sie ihn nicht weiter.</p>

<p>Dieser Link bleibt bis {validUntil} gültig.</p>
```

### 6. Security Considerations

#### 6.1 Access Control
- **No traditional authentication**: Continue using UUID-based validation
- **URL secrecy**: selfAdminId + participantId combination acts as secret token
- **Rate limiting**: Implement on "request access link" endpoint
- **Email verification**: Only send access links to registered email addresses

#### 6.2 Data Privacy
- **Minimal data exposure**: Only show messages/data relevant to the specific participant
- **No cross-participant data**: Strict filtering by participantId
- **Browser-only storage**: Credentials stored locally, never transmitted unnecessarily
- **Clear data**: Provide option to remove stored credentials from browser

#### 6.3 Message Filtering
```java
// Ensure messages are filtered correctly
private List<MessageTask> filterMessagesForParticipant(
    Participant participant,
    List<MessageTask> allMessages
) {
    String participantEmail = participant.getEmail().toLowerCase();
    
    return allMessages.stream()
        .filter(mt -> mt.getRecipientEmail().equalsIgnoreCase(participantEmail))
        .filter(mt -> !mt.getSendingResult().isDelieveryFailed())
        .filter(mt -> mt.getSendingStatus() == SendingStatus.SENDING_FINISHED)
        .collect(Collectors.toList());
}
```

### 7. Migration Strategy

#### Phase 1: Backend Foundation
1. Create `ParticipantPortalService` and `ParticipantPortalServiceRest`
2. Add new repository methods to `MessageTaskRepository`
3. Implement message retrieval logic with proper filtering
4. Create email template for access links
5. Add unit tests

#### Phase 2: Frontend Core
1. Create new route `/participant-portal` in main app router
2. Implement `ParticipantPortalStorageService`
3. Create Redux slice for participant portal state
4. Build main dashboard component
5. Implement "My Events" overview

#### Phase 3: Message History
1. Create message list and detail components
2. Implement message filtering and search
3. Add read/unread tracking
4. Test message display with various content types

#### Phase 4: Integration
1. Update registration flow to store credentials
2. Add links to portal from existing self-service pages
3. Implement "Request Access Link" functionality
4. Update existing self-service components to integrate with portal

#### Phase 5: Polish & Testing
1. Add i18n translations for all new strings
2. Comprehensive E2E tests with Cypress
3. Mobile responsive design verification
4. Performance optimization (lazy loading, caching)
5. Documentation updates

### 8. User Flows

#### Flow 1: New Registration
```
1. User registers for public event
2. Registration successful
   └─> Credentials automatically stored in browser
3. User receives confirmation email with portal link
4. User clicks portal link
5. Portal dashboard loads with event details and empty message list
```

#### Flow 2: Returning User
```
1. User visits /participant-portal
2. System loads credentials from local storage
3. Display "My Events" with all registered events
4. User selects an event
5. Portal dashboard loads with latest data
6. New messages are highlighted as unread
```

#### Flow 3: Lost Access
```
1. User visits /participant-portal/request-access
2. User enters email address and event identifier (title, date, or publicDinnerId)
3. System validates and sends email with access link
4. User clicks link in email
5. Credentials are stored in browser for future access
6. Portal dashboard loads
```

#### Flow 4: Message Notification
```
1. Organizer sends message to participants via admin panel
2. Message delivered via email (existing functionality)
3. Message also stored in database (existing)
4. Participant opens portal
5. New message appears with "unread" badge
6. Participant clicks message
7. Message content displayed, marked as read locally
```

### 9. Future Enhancements

#### 9.1 Push Notifications
- Browser push notifications when new messages arrive
- Requires service worker implementation
- Opt-in for participants

#### 9.2 Progressive Web App (PWA)
- Make portal installable on mobile devices
- Offline capability for viewing cached messages
- App-like experience

#### 9.3 Event Calendar Integration
- Export dinner date to calendar (iCal, Google Calendar)
- Automatic reminders

#### 9.4 Participant-to-Participant Messaging
- Allow team members to message each other within portal
- Moderated by organizer

#### 9.5 Photo Sharing
- Upload photos from the event
- Gallery view for all participants

#### 9.6 Feedback & Rating
- Post-event feedback form
- Rate the experience
- Suggestions for organizer

### 10. Technical Dependencies

#### New Dependencies
- **Frontend**: None required (use existing stack)
- **Backend**: None required (use existing Spring Boot stack)

#### Optional Dependencies
- `idb` (npm): For IndexedDB abstraction (if using IndexedDB)
- `dexie` (npm): Alternative IndexedDB wrapper with better TypeScript support

### 11. Database Schema Changes

No new tables required! We leverage existing infrastructure:

- **MessageTask table**: Already contains all sent messages with recipient email
- **Participant table**: Contains all participant data
- **RunningDinner table**: Contains event data
- **Team table**: Contains team assignments

Only new repository queries needed to filter messages by recipient.

### 12. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/participant-portal/v1/{selfAdminId}/{participantId}/data` | Get complete portal data |
| GET | `/rest/participant-portal/v1/{selfAdminId}/{participantId}/messages` | Get message history |
| PUT | `/rest/participant-portal/v1/{selfAdminId}/{participantId}/messages/{messageId}/read` | Mark message as read |
| POST | `/rest/participant-portal/v1/request-access` | Request access link via email |
| POST | `/rest/participant-portal/v1/my-events` | Get summary of multiple events |

### 13. I18n Keys

New translation keys needed:

```json
{
  "participant_portal": {
    "title": "Teilnehmer-Portal",
    "my_events_title": "Meine Events",
    "messages_title": "Nachrichten",
    "no_events": "Sie haben noch keine Events gespeichert.",
    "no_messages": "Noch keine Nachrichten vorhanden.",
    "request_access_button": "Zugang anfordern",
    "request_access_title": "Zugang zum Portal anfordern",
    "access_link_sent": "Ein Zugangslink wurde an Ihre E-Mail-Adresse gesendet.",
    "event_identifier_hint": "Event-Kennung (optional)",
    "event_identifier_help": "Name des Events, Datum oder Event-ID",
    "message_unread": "Ungelesen",
    "message_sent_at": "Gesendet am",
    "quick_actions": "Schnellzugriff",
    "view_dinner_route": "Dinner-Route ansehen",
    "manage_team_host": "Gastgeber verwalten",
    "manage_team_partner_wish": "Team-Partner-Wunsch bearbeiten",
    "event_details": "Event-Details",
    "your_team": "Ihr Team",
    "portal_info": "In diesem Portal finden Sie alle Informationen zu Ihrem Running Dinner Event."
  }
}
```

### 14. Testing Strategy

#### Unit Tests
- `ParticipantPortalService` methods
- Message filtering logic
- Access link generation
- Storage service functions

#### Integration Tests
- REST endpoint responses
- Database query correctness
- Email sending for access links

#### E2E Tests (Cypress)
```javascript
describe('Participant Portal', () => {
    it('stores credentials after registration', () => {
        // Register for event
        // Verify local storage contains credentials
    });
    
    it('displays my events page', () => {
        // Pre-populate local storage
        // Visit /participant-portal
        // Verify events are listed
    });
    
    it('shows message history', () => {
        // Login to portal
        // Navigate to messages
        // Verify messages are displayed
        // Click message
        // Verify marked as read
    });
    
    it('requests access link', () => {
        // Visit request access page
        // Fill form
        // Submit
        // Verify success message
    });
});
```

### 15. Performance Considerations

#### Caching Strategy
- Cache portal data in Redux store
- Implement TTL (time-to-live) for cached data
- Refresh on explicit user action

#### Lazy Loading
- Load messages on demand (paginated if many)
- Lazy load message content when expanded

#### Optimization
- Use React.memo for message list items
- Virtualized list for large message history
- Debounce search/filter operations

### 16. Monitoring & Analytics

Track usage metrics:
- Number of portal accesses per event
- Message read rates
- Most used self-service features
- Access link request frequency

## Conclusion

This Participant Portal provides a centralized, user-friendly interface for participants to access all their event-related information and functionalities. By leveraging browser local storage and the existing UUID-based authentication, we maintain security while providing a seamless experience without complex authentication mechanisms.

The phased implementation approach allows for incremental delivery of value while maintaining system stability. The architecture is designed to be extensible for future enhancements while keeping the initial scope manageable.
