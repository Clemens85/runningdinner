# Implementation Plan: Participant Portal — Event Overview

**Branch**: `001-participant-portal` | **Date**: 2026-02-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-participant-portal/spec.md`

## Summary

Add a Participant Portal that gives any registered participant or event organizer a centralized, browser-stored view of all their associated running dinner events — accessible without a traditional login. The first phase covers: replacing both the participant double opt-in email and the organizer creation email with combined confirmation+portal-access emails; persisting the portal token in `localStorage`; a new `/my-events` route in the landing app listing all events (live-fetched from the backend by submitting the token); a "My Events" nav entry; an inline access-recovery flow reusing the same persistent portal token; organizer admin-jump links; and a device-local "forget me" action.

**Security design**: The portal token is the sole credential stored in `localStorage`. Individual event credentials (`adminId`, `selfAdminId`, `participantId`) are never written to browser storage. On portal activation the frontend calls `GET /token/{portalToken}` (side-effect-free — safe against email scanner prefetch) and, only if confirmation params are present, a separate `POST /token/{portalToken}/confirm`. The `POST /my-events` endpoint accepts only the portal token and resolves all events server-side.

**Technical approach**: New `portal/` package on the backend (`ParticipantPortalServiceRest` → `ParticipantPortalService` → existing participant/dinner repositories); new Flyway migration `V2.11` for the `PortalToken` entity (one persistent token per email, reused for both initial access and recovery); portal token storage and API call logic in `shared/src/portal/`; UI in `webapp/src/portal/`. Existing confirmation email formatters and frontend activation page are modified to incorporate portal entry; no existing API contracts are broken.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript 5.x / React 18 (frontend)  
**Primary Dependencies**: Spring Boot 3.4+, Spring Data JPA, Spring Mail; React 18 + Vite + Material-UI v5, Axios, `@tanstack/react-query`, `react-hook-form` + Yup, `react-i18next`  
**Storage**: PostgreSQL — new `portal_token` table via Flyway `V2.11` migration; browser `localStorage` for the portal token string (token only, not credentials or event data)  
**Testing**: `@ApplicationTest` + existing Spring test helpers (backend); Vitest + Testing Library (frontend)  
**Target Platform**: Web — JVM server (Spring Boot on port 9090) + browser client (React SPA)  
**Project Type**: Full-stack web application (extension of existing monorepo)  
**Performance Goals**: Portal event list page < existing React Query defaults (~2 s p95 for network call); recovery email dispatched synchronously within the request (direct `MessageService` call from `ParticipantPortalService` — no async event needed)  
**Constraints**: No traditional session/login; all access via secret credentials; `adminId`, `selfAdministrationId`, `participantId` are confidential—must not be logged; rate-limit recovery email requests (one email per window per address); no cross-device credential sync; `localStorage` only (no `IndexedDB` in Phase 1)  
**Scale/Scope**: Incremental addition to existing system; new backend package (~6 classes + 1 interface + 1 entity + 1 repository); new frontend portal module (~6 components + 3 service/type files); 2 minimally modified email formatters (inject `PortalTokenProvider` interface — no portal package import in core); existing `ParticipantActivationPage` is NOT modified (old route stays pure core)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Portal ↔ Core separation**: The dependency direction is strictly portal → core, never core → portal. `ParticipantPortalService` reads from core repositories (`RunningDinnerRepository`, `ParticipantRepository`) — that is acceptable one-way coupling. Core email formatters must NOT import from `org.runningdinner.portal`; they depend only on a `PortalTokenProvider` interface placed in a neutral package (e.g. `org.runningdinner.mail`). `ParticipantPortalService` implements that interface. Formatters inject it as `Optional<PortalTokenProvider>` and fall back to the legacy URL if absent. The existing `ParticipantActivationPage` (core) is not modified — the new `PortalActivationPage` is a separate component in `webapp/src/landing/portal/` that calls only portal endpoints. Frontend portal code in `shared/src/portal/` and `webapp/src/landing/portal/` must not import from admin, self, or wizard modules.
- ✅ **Controller → Service → Repository**: `ParticipantPortalServiceRest` handles HTTP only and delegates to `ParticipantPortalService`; `ParticipantPortalService` uses existing `RunningDinnerRepository`, `ParticipantRepository`, and the new `PortalTokenRepository`. No direct DB access from the controller.
- ✅ **Event-driven side effects**: Recovery email is sent synchronously within the request — `ParticipantPortalService` calls `MessageService` directly (no new event or listener needed). This is acceptable because recovery email dispatch is the primary purpose of the `POST /access-recovery` request and has no other transactional side effects that require decoupling. Modified confirmation formatters do not call mail directly — the upstream event chain (`NewParticipantSubscribedEvent`, `NewRunningDinnerEvent`) remains intact.
- ✅ **Shared-first frontend logic**: `PortalService.ts` (API calls), `PortalTypes.ts`, and `PortalStorageService.ts` live in `shared/src/portal/`. All API calls use `BackendConfig.buildUrl()`. React Query hooks wrap service functions. UI components (`MyEventsPage`, `MyEventsEntryList`, etc.) live in `webapp/src/landing/portal/` — they are device/framework-dependent.
- ✅ **Stable contracts and IDs**: `adminId`, `selfAdministrationId`, and `participantId` are treated as secrets. They are returned only over authenticated/secret pathways (portal access endpoints). The existing `/activate` and `/acknowledge` endpoints are not broken; the activation page is augmented to call the new portal endpoint after confirmation.
- ✅ **Data and schema discipline**: New `portal_token` table added via `V2.11__AddPortalToken.sql`. New `PortalEventEntryTO` DTOs are separate from JPA entities. No entity exposed directly through REST.
- ✅ **Tests**: New backend service tests using `@ApplicationTest`; frontend Vitest tests for `PortalStorageService` and `PortalService`; updated tests for modified email formatters.

**GATE STATUS: PASS** — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-participant-portal/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Backend (Spring Boot)
runningdinner-backend/src/main/java/org/runningdinner/
├── portal/                                         # NEW package
│   ├── ParticipantPortalServiceRest.java           # REST controller — GET /token/{t} (validate), POST /token/{t}/confirm, POST /my-events, POST /access-recovery
│   ├── ParticipantPortalService.java               # Business logic — validatePortalToken, performEventConfirmation, resolveMyEvents (by token), requestAccessRecovery, getOrCreatePortalToken
│   ├── PortalToken.java                             # JPA entity — id, email, token, lastRecoveryEmailSentAt
│   ├── PortalTokenRepository.java                   # Spring Data JPA repository
│   ├── PortalConfirmRequestTO.java                  # POST /token/{t}/confirm body — confirmPublicDinnerId, confirmParticipantId, confirmAdminId (all optional)
│   ├── PortalMyEventsRequestTO.java                 # POST /my-events body — portalToken string
│   ├── PortalEventEntryTO.java                     # Response DTO — eventName, eventDate, city, role, adminUrl
│   └── PortalCredentialTO.java                     # Internal helper only (not part of API contract)
├── mail/
│   ├── PortalTokenProvider.java                     # NEW interface (neutral location) — getOrCreatePortalToken(email): String; implemented by ParticipantPortalService
│   └── formatter/
│       ├── NewParticipantSubscribedFormatter.java   # MODIFIED — injects Optional<PortalTokenProvider>; uses portal URL when present, falls back to legacy URL; no import of portal package
│       └── RunningDinnerEventCreatedMessageFormatter.java  # MODIFIED — same Optional<PortalTokenProvider> injection for organizer confirmation link

runningdinner-backend/src/main/resources/db/migration/
└── V2.11__AddPortalToken.sql                        # NEW Flyway migration

# Frontend shared library (reusable logic, no DOM)
runningdinner-client/shared/src/portal/             # NEW module
├── PortalTypes.ts                                  # TypeScript types: PortalEventEntry, PortalRole (no credential types — token only stored)
├── PortalService.ts                                # API calls: validatePortalToken (GET), confirmPortalEvent (POST), fetchMyEvents (POST), requestAccessRecovery (POST)
├── PortalStorageService.ts                         # localStorage R/W for portal token string (key: runningdinner_portal_token)
└── useMyEvents.ts                                  # React Query hook — reads stored token, calls fetchMyEvents

# Frontend webapp (UI components)
runningdinner-client/webapp/src/landing/portal/     # NEW directory
├── MyEventsPage.tsx                                # Portal landing page — event list or empty state + recovery form
├── MyEventsEntryList.tsx                           # Renders PortalEventEntry list
├── MyEventsEmptyState.tsx                          # Empty state + inline access recovery form
├── PortalActivationPage.tsx                        # Redemption page for participant and organizer portal links
└── ForgetMeAction.tsx                              # "Forget me on this device" button + confirmation

runningdinner-client/webapp/src/landing/
└── LangingRoute.tsx                                # MODIFIED — add /my-events, /my-events/participant/:publicDinnerId/:participantId, /my-events/organizer/:adminId, /my-events/recover/:token routes

runningdinner-client/webapp/src/common/mainnavigation/
└── (modified to add "My Events" nav item in landing nav only)
```

**Structure Decision**: Option 2 (Web application — frontend + backend). Backend uses new `portal/` package following domain-driven conventions. Frontend logic in `shared/src/portal/` per Shared-First principle; UI in `webapp/src/landing/portal/` since it is framework-dependent.

## Complexity Tracking

No constitution violations — complexity tracking table not required.
