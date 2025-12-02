# RunYourDinner - AI Development Instructions

## Project Overview

RunYourDinner is a full-stack web application for creating and managing running dinner events. The architecture consists of:

- **Backend**: Spring Boot 3.4+ Java 21 application (`runningdinner-backend/`)
- **Frontend**: React 18 + TypeScript + Vite monorepo (`runningdinner-client/`)
  - `webapp/`: Main React application with Material-UI
  - `shared/`: Shared components, services, types, and Redux state
- **E2E Testing**: Cypress tests (`e2e-tests/`)

## Development Workflow

### Backend Development

```bash
# Start backend (builds JAR if needed)
cd runningdinner-backend && ./start-backend.sh

# Manual build and run
./mvnw package -DskipTests
java -jar -Dspring.profiles.active=dev,demodinner,webpack target/runningdinner-2.0.0.jar
```

### Frontend Development

```bash
# Install dependencies (uses pnpm workspace)
cd runningdinner-client && pnpm install

# Start development servers
pnpm -r run dev  # Starts both shared and webapp in dev mode
# Or individually:
cd webapp && pnpm run dev    # Main app on Vite dev server
cd shared && pnpm run dev    # Shared library in watch mode
```

### Testing

```bash
# Frontend unit tests
cd runningdinner-client && pnpm test

# E2E tests
cd e2e-tests && ./run-headless.sh
# Or interactive: npx cypress open
```

## Architecture Patterns

### Backend API Structure

- RESTful services organized by domain: `/wizardservice/v1/`, `/masterdataservice/v1/`, etc.
- Spring Boot profiles: `dev`, `demodinner`, `webpack` for local development
- PostgreSQL with Flyway migrations
- Use of Spring Data JPA repositories for database access and Spring services for business logic. Rest Controllers handle just HTTP communication and delegate to services.

### Frontend Architecture

- **Monorepo**: `shared` package provides common utilities (non-browser dependent), services, types to `webapp`. If possible logic should be placed in `shared` and then used from within `webapp`
- **State Management**: Mostly plain React and some minor usage of Redux Toolkit with typed slices in `shared/src/admin/redux/`
- **Data Fetching**: React Query (`@tanstack/react-query`) for server state management
- **HTTP Client**: Axios with centralized `BackendConfig` for URL construction
- **Routing**: React Router 6 with domain-based route organization (`/admin/`, `/wizard/`, `/self/`)
- **I18n**: react-i18next with translations in `shared/src/i18n/translations/`

### Key Service Patterns

```typescript
// All backend communication via BackendConfig
const url = BackendConfig.buildUrl(`/wizardservice/v1/create`);
// Set via: BackendConfig.setBaseUrl(process.env.REACT_APP_BACKEND_BASE_URL);

// Shared components exported from index.ts
import { Fullname, AddressLocation, TeamNr } from "@runningdinner/shared";

// Domain services in shared/src/admin/, shared/src/wizard/, etc.
import { ParticipantService, TeamService } from "@runningdinner/shared";
```

### Component Organization

- **Domain-based folders**: `admin/`, `wizard/`, `landing/`, `self/`
- **Shared utilities**: Material-UI theming, form validation (Yup), drag-and-drop
- **React Query**: `@tanstack/react-query` for server state management
- **Forms**: `react-hook-form` with Yup validation schemas

## Development Environment Setup

### Backend Configuration

- Default port: 9090 (`server.port=9090`)
- Database: PostgreSQL on localhost:5432/runningdinner
- Profiles for different environments in `application-{profile}.properties`

### Frontend Configuration

- Vite development server with HMR
- Environment variables: `REACT_APP_BACKEND_BASE_URL` for API base
- Material-UI v5 with emotion styling
- Google Maps integration via `@vis.gl/react-google-maps`

## Common Patterns

### Error Handling

- Backend: Spring Boot exception handling with structured error responses
- Frontend: Error boundaries, axios interceptors in `HttpInterceptorConfig`

### Data Flow

1. User interactions in React components
2. Redux actions dispatch to update state
3. Services make API calls via `BackendConfig.buildUrl()`
4. Backend processes via domain services (participant, team, dinner management)
5. Database updates via JPA/Hibernate with Flyway migrations

### Key Files to Reference

- `shared/src/index.ts`: All shared exports
- `Constants.ts`: Application-wide constants
- Domain service files: `ParticipantService.ts`, `TeamService.ts`, etc.
- Redux slices: `shared/src/admin/redux/`

## Testing Approach

- **Unit**: Vitest for React components and utilities
- **Integration**: Spring Boot test slices for backend services
- **E2E**: Cypress with page objects in `cypress/support/`
- Test data fixtures in `cypress/fixtures/` and `route-data/` for geographic samples

## Building Blocks

### Administration of Event

Upon creating a running dinner event, the organizer receives a unique admin link to manage participants, teams, and settings. This link is secret and should not be shared publicly.
The organizer needs always this link (respectively the contained adminId) to access the administration functionalities.

### Public Events

All open and public events can be accessed via a public event link. This link is used by participants to register for the event and view relevant information. For open events this link is like a secret URL that should not be shared publicly to avoid unwanted registrations.

### Participant Self-Service

Participants can access some functionality like Dinner Routes, Managing Team Hosts etc. via a self-service link sent to them after registration. This link is unique to each participant and should be kept confidential.
