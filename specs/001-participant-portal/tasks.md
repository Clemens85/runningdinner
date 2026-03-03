# Tasks: Participant Portal — Event Overview

**Input**: Design documents from `/specs/001-participant-portal/`
**Prerequisites met**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/rest-api.md ✅ quickstart.md ✅

**Organization**: Tasks grouped by user story (US1–US6) for independent implementation and testing.  
**No tests by default** — test tasks are included only where the plan.md explicitly names test files or the constitution mandates coverage for changed behavior.  
**Backend rule**: Always inject and call existing domain **services** (e.g. `ParticipantService`, `RunningDinnerService`) instead of wiring domain repositories directly. `ParticipantPortalService` may only hold a direct reference to its own `PortalTokenRepository`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared state dependencies)
- **[Story]**: Maps to user story (US1–US6) from spec.md
- Exact file paths are given for every task

---

## Phase 1: Setup

**Purpose**: Create the new package and module directories so all subsequent tasks have a place to land.

- [X] T001 Create backend portal package `runningdinner-backend/src/main/java/org/runningdinner/portal/`
- [X] T002 [P] Create frontend portal module dirs `runningdinner-client/shared/src/portal/` and `runningdinner-client/webapp/src/portal/` (own top-level module, same level as `landing/`, `admin/`, `wizard/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure — entity, repositories, DTOs, types, and the storage service — that EVERY user story depends on. No user story work can begin until this phase is complete.

⚠️ **CRITICAL**: All of Phase 2 must complete before Phase 3 can start.

- [X] T003 Create Flyway migration `runningdinner-backend/src/main/resources/db/migration/V2.11__AddPortalToken.sql` per data-model.md (table `portal_token` with `id`, `email` UNIQUE, `token` UNIQUE, `created_at`, `modified_at`, `last_recovery_email_sent_at`)
- [X] T004 Create `PortalToken` JPA entity extending `AbstractEntity` in `runningdinner-backend/src/main/java/org/runningdinner/portal/PortalToken.java` (fields: `email`, `token`, `lastRecoveryEmailSentAt`; unique constraints per data-model.md)
- [X] T005 [P] Create `PortalTokenRepository` Spring Data JPA interface in `runningdinner-backend/src/main/java/org/runningdinner/portal/PortalTokenRepository.java` (methods: `findByEmail`, `findByToken`)
- [X] T006 [P] Create `PortalRole` enum `{PARTICIPANT, ORGANIZER}` in `runningdinner-backend/src/main/java/org/runningdinner/portal/PortalRole.java`
- [X] T007 [P] Create backend DTOs in `runningdinner-backend/src/main/java/org/runningdinner/portal/`: `PortalCredentialTO` (role, selfAdminId, participantId, adminId), `PortalMyEventsRequestTO` (credentials list), `PortalEventEntryTO` (eventName, eventDate, city, role, adminUrl), `PortalAccessResponseTO` (credentials list) — per data-model.md
- [X] T008 [P] Create `PortalTokenProvider` interface in `runningdinner-backend/src/main/java/org/runningdinner/mail/PortalTokenProvider.java` with single method `String getOrCreatePortalToken(String email)` — this is the only interface core email formatters will depend on (plan.md constitution check)
- [X] T009 [P] Create `PortalTypes.ts` in `runningdinner-client/shared/src/portal/PortalTypes.ts` with `PortalRole`, `ParticipantPortalCredential`, `OrganizerPortalCredential`, `PortalCredential` (union), `PortalEventEntry` — per data-model.md TypeScript types section
- [X] T010 Create `PortalStorageService.ts` in `runningdinner-client/shared/src/portal/PortalStorageService.ts` implementing `getStoredCredentials()`, `mergeCredentials(incoming)` (deduplicate by composite key), `clearAllCredentials()` using `localStorage` key `runningdinner_portal_credentials`; create `PortalStorageService.test.ts` alongside it covering merge deduplication and clear

**Checkpoint**: All foundational artifacts exist — user story phases can now proceed.

---

## Phase 3: User Story 1 — Participant Views Registered Event via Portal Link (Priority: P1) 🎯 MVP

**Goal**: A participant receives a combined confirmation+portal email, clicks the link, their registration is confirmed (idempotent), and the portal displays their event(s). Credentials are persisted in browser storage.

**Independent Test**: Register for an open event → receive email → click the `/my-events/{portalToken}?confirmPublicDinnerId=...&confirmParticipantId=...` link → verify confirmation happened and event is shown → close browser → reopen `/my-events` from storage → event still listed.

- [X] T011 [US1] Create `ParticipantPortalService` in `runningdinner-backend/src/main/java/org/runningdinner/portal/ParticipantPortalService.java`; implement `getOrCreatePortalToken(String email)` (lookup or insert `PortalToken` row) and implement `PortalTokenProvider`; inject `PortalTokenRepository`
- [X] T012 [US1] Implement `resolveCredentialsByToken(String portalToken, String confirmPublicDinnerId, UUID confirmParticipantId, String confirmAdminId)` in `ParticipantPortalService.java`: look up `PortalToken` by token (404 if missing); if `confirmPublicDinnerId`+`confirmParticipantId` present perform idempotent participant registration confirmation via `ParticipantService`; resolve ALL `(selfAdministrationId, participantId)` pairs for the email via `ParticipantService`; also collect `adminId` for any owned `RunningDinner` rows via `RunningDinnerService`; return `PortalAccessResponseTO`
- [X] T013 [US1] Create `ParticipantPortalServiceRest.java` in `runningdinner-backend/src/main/java/org/runningdinner/portal/ParticipantPortalServiceRest.java`; map `GET /rest/participant-portal/v1/token/{portalToken}` with optional query params `confirmPublicDinnerId`, `confirmParticipantId`; delegate entirely to `ParticipantPortalService.resolveCredentialsByToken()` per contracts/rest-api.md
- [X] T014 [US1] Modify `NewParticipantSubscribedMessageFormatter` (locate via grep in `runningdinner-backend/src/main/java/`): inject `Optional<PortalTokenProvider>`; replace the existing double-opt-in activation URL with `{host}/my-events/{portalToken}?confirmPublicDinnerId={publicId}&confirmParticipantId={participantId}` when provider is present; fall back to legacy URL if absent — do NOT import from `org.runningdinner.portal`
- [X] T015 [P] [US1] Create `PortalService.ts` in `runningdinner-client/shared/src/portal/PortalService.ts`; implement `resolvePortalToken(portalToken, params?)` calling `GET /rest/participant-portal/v1/token/{portalToken}` via `BackendConfig.buildUrl()`; return `PortalAccessResponseTO` shape
- [X] T016 [US1] Create `PortalActivationPage.tsx` in `runningdinner-client/webapp/src/portal/PortalActivationPage.tsx`: extract `portalToken` from path params and any confirmation query params; call `resolvePortalToken()`; on success call `mergeCredentials()` then navigate to `/my-events`; show loading indicator during fetch; show generic error on 404
- [X] T017 [US1] Create `runningdinner-client/webapp/src/portal/PortalApp.tsx` as the portal module entry point with its own React Router `<Routes>` block; register route `/my-events/:portalToken` → `PortalActivationPage` (additional routes added in T024)
- [X] T018 [US1] Create `ParticipantPortalServiceTest.java` in `runningdinner-backend/src/test/java/org/runningdinner/portal/ParticipantPortalServiceTest.java` using `@ApplicationTest`; cover: token creation idempotency, resolveCredentialsByToken with valid participant confirmation, resolveCredentialsByToken idempotent re-confirm, 404 on unknown token

**Checkpoint**: User Story 1 is independently functional — participant email link opens portal and shows event.

---

## Phase 4: User Story 2 — Participant Sees All Their Events on the Portal Landing Page (Priority: P2)

**Goal**: The `/my-events` landing page reads stored credentials, fetches live event summaries from `POST /my-events`, and renders the event list. Deleted events are silently omitted.

**Independent Test**: Visit two separate portal links on the same device → navigate to `/my-events` → verify both events listed → note: requires US1 credential storage to already work.

- [X] T019 [US2] Implement `resolveMyEvents(PortalMyEventsRequestTO request)` in `ParticipantPortalService.java`: for each PARTICIPANT credential look up the `RunningDinner` by `selfAdministrationId` via `RunningDinnerService` and the `Participant` by `participantId` via `ParticipantService`; for each ORGANIZER credential look up `RunningDinner` by `adminId` via `RunningDinnerService`; silently skip unresolvable entries; return `PortalMyEventsResponseTO` (add wrapper DTO if needed) with list of `PortalEventEntryTO`
- [X] T020 [US2] Add `POST /rest/participant-portal/v1/my-events` endpoint to `ParticipantPortalServiceRest.java`; accept `PortalMyEventsRequestTO`; delegate to `ParticipantPortalService.resolveMyEvents()`; always return `200 OK` per contracts/rest-api.md
- [X] T021 [P] [US2] Add `fetchMyEvents(credentials: PortalCredential[])` to `PortalService.ts` calling `POST /rest/participant-portal/v1/my-events`; create `useMyEvents.ts` in `runningdinner-client/shared/src/portal/useMyEvents.ts` React Query hook wrapping `fetchMyEvents` with credentials from `getStoredCredentials()`
- [X] T022 [P] [US2] Create `MyEventsEntryList.tsx` in `runningdinner-client/webapp/src/portal/MyEventsEntryList.tsx`: render a list of `PortalEventEntry` items each showing event name, event date, city, and role badge; admin action link placeholder for ORGANIZER role (implemented fully in US5)
- [X] T023 [US2] Create `MyEventsPage.tsx` in `runningdinner-client/webapp/src/portal/MyEventsPage.tsx`: invoke `useMyEvents`; if loading show spinner; if events present render `MyEventsEntryList`; if empty show empty-state placeholder (recovery form wired in US4); if error show generic message
- [X] T024 [US2] Register route `/my-events` → `MyEventsPage` in `PortalApp.tsx` (same file as T017)
- [X] T025 [US2] Export `PortalCredential`, `PortalEventEntry`, `PortalRole`, `PortalStorageService`, `PortalService`, `useMyEvents` from `runningdinner-client/shared/src/index.ts`
- [X] T026 [US2] Create `MyEventsPage.test.tsx` in `runningdinner-client/webapp/src/portal/MyEventsPage.test.tsx`; mock `useMyEvents`; test: loading state, event list renders, empty state shown when no credentials, deleted-event omission (empty response)

**Checkpoint**: Navigating to `/my-events` shows all stored events live-fetched from the backend.

---

## Phase 5: User Story 3 — "My Events" Navigation Entry (Priority: P3)

**Goal**: A "My Events" nav entry is visible on the shared navigation bar used by both the landing page and the portal. Admin and wizard do not need guards — they each render their own isolated navigation and never include the shared navbar.

**Independent Test**: Visit the public landing page → verify "My Events" link is visible in the navbar → click it → portal landing page (`/my-events`) opens. Visit the portal directly → verify the same shared navbar with "My Events" appears. No need to verify admin or wizard (isolated navs).

- [X] T027 [US3] Locate the existing common/shared navbar component in `runningdinner-client/webapp/src/` (grep for the landing header/navbar); extract it into the existing common package (e.g. `runningdinner-client/webapp/src/common/`) if not already there; add a "My Events" navigation entry linking to `/my-events`
- [X] T028 [P] [US3] Wire `PortalApp.tsx` into the top-level app routing in `runningdinner-client/webapp/src/` (locate `App.tsx`, `index.tsx`, or Vite entrypoint) so that `/my-events` and `/my-events/:portalToken` are served by the portal module alongside the existing landing, admin, and wizard modules
- [X] T029 [P] [US3] Use the shared navbar component (extracted in T027) inside `PortalApp.tsx` so the portal renders the same top-level navigation as the landing page — including the newly added "My Events" link

**Checkpoint**: "My Events" link visible in shared navbar on both landing and portal; admin and wizard unaffected (their isolated navs have no reference to this component).

---

## Phase 6: User Story 4 — Access Recovery via Email (Priority: P4)

**Goal**: A user on a device with no stored events can submit their email and receive a recovery link that restores all their events in one click. Rate-limiting prevents abuse. Response is always generic.

**Independent Test**: Fresh browser → `/my-events` → empty state with inline form → submit known email → receive email → click link → all events restored.

- [X] T030 [US4] Implement `requestAccessRecovery(String email)` in `ParticipantPortalService.java`: look up (or create) `PortalToken` for this email; check `lastRecoveryEmailSentAt` — if within cooldown window skip email and return; if events exist (participant or organizer) send recovery email with portal link `{host}/my-events/{portalToken}` via `MessageService`; update `lastRecoveryEmailSentAt`; always return generic response regardless of outcome
- [X] T031 [US4] Add `POST /rest/participant-portal/v1/access-recovery` endpoint to `ParticipantPortalServiceRest.java`; accept `{"email": "..."}` body; delegate to `ParticipantPortalService.requestAccessRecovery()`; always return `200 OK` with generic message per contracts/rest-api.md anti-enumeration requirement
- [X] T032 [US4] Create `ParticipantPortalAccessRecoveryMessageFormatter.java` in `runningdinner-backend/src/main/java/org/runningdinner/mail/formatter/`: format recovery email HTML with portal link `{host}/my-events/{token}`; support both DE and EN locales (messages_de.properties and messages_en.properties)
- [X] T033 [P] [US4] Add `requestAccessRecovery(email: string)` to `PortalService.ts` calling `POST /rest/participant-portal/v1/access-recovery`
- [X] T034 [P] [US4] Create `AccessRecoveryForm.tsx` in `runningdinner-client/webapp/src/portal/AccessRecoveryForm.tsx`: email input with `react-hook-form` + Yup validation; on submit call `requestAccessRecovery()`; show success message after submission regardless of outcome (mirrors backend generic response)
- [X] T035 [US4] Integrate `AccessRecoveryForm` into `MyEventsPage.tsx` empty state — render form inline when event list is empty, per FR-006 (no separate page navigation)
- [X] T036 [US4] Create `PortalService.test.ts` in `runningdinner-client/shared/src/portal/PortalService.test.ts`; test: `requestAccessRecovery()` posts to correct URL, handles both success and error responses

**Checkpoint**: Full access recovery loop works — empty state → email → link → events restored.

---

## Phase 7: User Story 5 — Organizer Sees Owned Events and Admin Jump Link (Priority: P5)

**Goal**: Organizer's combined portal link confirms their email address (idempotent) and loads the portal showing their owned events with a direct admin link. Recovery also restores organizer events.

**Independent Test**: Create an event via wizard → receive combined confirmation+portal email → click link → email confirmed → portal shows owned event with "Manage event" link → click it → admin area opens.

- [X] T037 [US5] Implement `confirmAdminId` handling in `ParticipantPortalService.resolveCredentialsByToken()`: if `confirmAdminId` query param is present, look up the `RunningDinner` via `RunningDinnerService`, set `acknowledgedDate` to the current date/time if it is currently null (idempotent — leave unchanged if already set), persist via `RunningDinnerService`; logic already in place for organizer credential collection, ensure it also works via this flow
- [X] T038 [US5] Modify `RunningDinnerEventCreatedMessageFormatter` (locate in `runningdinner-backend/src/main/java/`): inject `Optional<PortalTokenProvider>`; replace the existing organizer acknowledge URL with `{host}/my-events/{portalToken}?confirmAdminId={adminId}` when provider is present; retain existing admin management link (`{host}/admin/{adminId}`) unchanged; do NOT import from `org.runningdinner.portal`
- [X] T039 [US5] Implement ORGANIZER credential resolution in `ParticipantPortalService.resolveMyEvents()`: for ORGANIZER credentials look up `RunningDinner` by `adminId` via `RunningDinnerService`; populate `PortalEventEntryTO.adminUrl` as the full admin URL `{host}/admin/{adminId}`; silently skip missing events
- [X] T040 [P] [US5] Handle `?confirmAdminId` query param in `runningdinner-client/webapp/src/portal/PortalActivationPage.tsx` — pass it through to `resolvePortalToken()` call (endpoint already handles it, frontend just needs to forward the param)
- [X] T041 [P] [US5] Render admin action link in `runningdinner-client/webapp/src/portal/MyEventsEntryList.tsx` for entries where `role === "ORGANIZER"` and `adminUrl` is non-null; label "Manage event" (or i18n equivalent); ensure participant entries show no admin action per FR-008

**Checkpoint**: Organizer portal link works end-to-end; admin jump link navigates correctly.

---

## Phase 8: User Story 6 — Forget Me on This Device (Priority: P6)

**Goal**: A user can clear all locally stored portal credentials from within the portal. Server-side data is unaffected. After clearing, the portal shows the empty state with inline recovery form.

**Independent Test**: Store events → trigger "Forget me" action → confirm dialog → portal shows empty state → check `localStorage` — key `runningdinner_portal_credentials` is absent.

- [X] T042 [P] [US6] Create `ForgetMeButton.tsx` in `runningdinner-client/webapp/src/portal/ForgetMeButton.tsx`: button that opens a MUI confirmation dialog; on confirm calls `clearAllCredentials()` from `PortalStorageService` then navigates to `/my-events` (empty state will render naturally)
- [X] T043 [US6] Integrate `ForgetMeButton` into `runningdinner-client/webapp/src/portal/MyEventsPage.tsx`: render it when event list is non-empty; confirm dialog text must clarify that server data is unaffected (FR-013)

**Checkpoint**: "Forget me" clears browser storage and shows empty state; server data unchanged.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: i18n completeness, backward compatibility for old email links, and final integration sign-off.

- [X] T044 [P] Add portal i18n keys to `runningdinner-client/shared/src/i18n/translations/` (both `de` and `en`): keys for "My Events" nav label, empty state message, recovery form labels/placeholders/submit, "Forget me on this device" button and dialog text, event role badge labels (Participant / Organizer), "Manage event" link label
- [X] T045 Add backward-compatibility route in the landing module (`runningdinner-client/webapp/src/landing/`): handle old URL `/running-dinner-events/:publicDinnerId/:participantId/activate` — perform existing activation logic then redirect to `/my-events` so the user lands in the portal; per quickstart.md Flow E
- [X] T046 Ensure all portal UI components (`ForgetMeButton`, `AccessRecoveryForm`, `MyEventsEntryList`, `MyEventsPage`, `PortalActivationPage`) are imported only within `runningdinner-client/webapp/src/portal/`; verify none leak into `shared` or cross-import from `landing/`, `admin/`, or `wizard/`
- [X] T047 Run quickstart.md Flows A–E manually against the integrated system and fix any deviations; update quickstart.md if any URLs or steps changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup         — no dependencies
Phase 2: Foundational  — depends on Phase 1 — BLOCKS ALL user stories
Phase 3: US1 (P1)     — depends on Phase 2
Phase 4: US2 (P2)     — depends on Phase 3 (needs credential storage + PortalActivationPage for E2E test)
Phase 5: US3 (P3)     — depends on Phase 4 (MyEventsPage must exist for nav to link to)
Phase 6: US4 (P4)     — depends on Phase 4 (injects form into MyEventsPage empty state)
Phase 7: US5 (P5)     — depends on Phase 3 (extends resolveCredentialsByToken) + Phase 4 (extends resolveMyEvents and MyEventsEntryList)
Phase 8: US6 (P6)     — depends on Phase 4 (integrates into MyEventsPage)
Phase 9: Polish        — depends on all prior phases
```

### User Story Dependencies

| Story | Hard dependency | Notes |
|---|---|---|
| US1 (P1) | Phase 2 complete | Standalone — establishes credential storage |
| US2 (P2) | US1 complete | Needs credential storage from US1 |
| US3 (P3) | US2 complete | MyEventsPage must exist to link "My Events" to |
| US4 (P4) | US2 complete | Empty state injection target must exist |
| US5 (P5) | US1 + US2 complete | Extends both backend service and frontend list component |
| US6 (P6) | US2 complete | Integrates into MyEventsPage |

### Parallel Opportunities (within each phase)

**Phase 2 (Foundational)**: T005, T006, T007, T008, T009 can all run in parallel after T004.  
**Phase 3 (US1)**: T011–T014 can run in parallel with T015 (shared package starts independently).  
**Phase 4 (US2)**: T019 and T020 are sequential; T021, T022 are parallel after T020; T023 depends on T021+T022.  
**Phase 6 (US4)**: T033 and T034 are parallel (different packages); T035 depends on T033+T034.  
**Phase 7 (US5)**: T040 and T041 are parallel (different files); both depend on T037–T039.  
**Phase 8 (US6)**: T042 is parallel-safe; T043 depends on T042.

---

## Implementation Strategy

### MVP Scope (User Story 1 only)

1. Phase 1: Setup
2. Phase 2: Foundational — complete before anything else
3. Phase 3: US1 — participant portal link confirms registration and shows event
4. **STOP + VALIDATE**: participant email → click link → event shown → reopen browser → event persists

### Incremental Delivery Order

| Step | Deliverable | Validates |
|---|---|---|
| Phase 1 + 2 | Foundation built | Migration runs; types compile |
| + Phase 3 | MVP: participant link works | US1 acceptance scenarios 1–5 |
| + Phase 4 | Event list page | US2 acceptance scenarios 1–4 |
| + Phase 5 | "My Events" nav entry | US3 acceptance scenarios 1–4 |
| + Phase 6 | Access recovery | US4 acceptance scenarios 1–4 |
| + Phase 7 | Organizer portal | US5 acceptance scenarios 1–6 |
| + Phase 8 | Forget me | US6 acceptance scenarios 1–4 |
| + Phase 9 | Polish + compat | quickstart Flows A–E pass |

### Parallel Team Strategy (2+ developers)

After Phase 2 completes:
- **Dev A**: Phase 3 (US1) → Phase 7 (US5) — backend-heavy thread
- **Dev B**: Phase 4 (US2) → Phase 5 (US3) → Phase 8 (US6) — frontend-heavy thread
- **Dev C**: Phase 6 (US4) in parallel once Phase 4 is done

---

## Task Summary

| Phase | Tasks | Parallel | Story |
|---|---|---|---|
| 1 Setup | T001–T002 | 1 | — |
| 2 Foundational | T003–T010 | 5 | — |
| 3 US1 (P1) | T011–T018 | 1 | US1 |
| 4 US2 (P2) | T019–T026 | 2 | US2 |
| 5 US3 (P3) | T027–T029 | 2 | US3 |
| 6 US4 (P4) | T030–T036 | 2 | US4 |
| 7 US5 (P5) | T037–T041 | 2 | US5 |
| 8 US6 (P6) | T042–T043 | 1 | US6 |
| 9 Polish | T044–T047 | 1 | — |
| **Total** | **47 tasks** | **17 parallelizable** | 6 stories |
