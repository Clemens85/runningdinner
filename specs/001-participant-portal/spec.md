# Feature Specification: Participant Portal — Event Overview

**Feature Branch**: `001-participant-portal`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "Specify a first basic specification for the participant portal: a user can access it after registration and sees their registered events. Administrators that create an event may also see their owned events and can access their administration URL in this portal."

## Overview

The Participant Portal is a centralized, personal area where anyone who has registered for or created a running dinner event can see all their associated events in one place. This first phase covers portal access and event overview — allowing participants to see events they registered for, and allowing organizers to see events they created together with a direct link to their administration area.

Access to the portal requires no traditional login. Instead, a personal portal link (email-scoped) serves as the entry point. A portal link is unique per email address: when opened, it loads all events (participant registrations and organized events) associated with that email and populates the browser with the corresponding credentials. **The portal link is designed for initial access and recovery only.** Ongoing use navigates via browser-stored credentials through the portal landing page ("My Events") — not by revisiting the link directly.

The portal link is unified with the existing confirmation email flow. For participants, the registration confirmation email (double opt-in) is replaced by a single combined email whose link both confirms **that specific event registration** (per-event, idempotent) and serves as the email-scoped portal entry point. For organizers, the event creation confirmation email works symmetrically — the link confirms the organizer's email address for that specific event (per-event, idempotent) and opens the portal. Clicking the link again after confirmation is already done is handled silently with no error or warning.

Event data displayed in the portal is always fetched live from the backend. The browser stores only the access credentials (identifiers) — not a local copy of event data. If an event has been deleted or is otherwise unavailable, it will not appear in the portal even if credentials for it remain in browser storage.

---

## Clarifications

### Session 2026-02-25

- Q: Should the confirmation email (double opt-in for participants, event confirmation for organizers) be unified into a single email that also serves as the portal access link, or kept separate? → A: One combined email. The existing confirmation email is replaced by a single email whose link confirms the registration/event (idempotent) AND opens the portal. No separate portal-link email is sent.
- Q: When a user submits access recovery and has multiple events registered, what do they receive? → A: One email containing one person-scoped recovery link. When clicked, that link restores all events associated with the user's email address into the browser's portal in a single step.
- Q: When a user clicks "My Events" in the navigation and has no events stored in the browser, what should happen? → A: Navigate to the portal landing page; if empty, the empty state and the access recovery form are shown inline on the same page — no separate page or extra navigation step.
- Q: When an organizer clicks their combined portal link, what does "confirm" mean — email confirmation only, or event activation? → A: Email address confirmation only (double opt-in), symmetric with the participant flow. Event visibility and activation remain a separate, explicit admin action and are not affected by clicking the link.
- Note: Portal links are email-scoped (one link per email address). Opening a portal link loads and caches all events for that email. The link is for initial/recovery access only; ongoing use goes via browser storage and the "My Events" navigation.
- Note: Confirmation triggered by a portal link is per-event — the link confirms the specific registration or event creation that triggered the email. The portal view it opens is email-scoped (all events for that email).
- Note: Event data is always fetched live from the backend. Browser storage holds only access credentials (identifiers), not cached event data.
- Note: A "forget me on this device" feature is required, allowing users to clear all locally stored portal credentials from within the portal.
- Note: Deleted events will not appear in the portal even if their credentials remain in browser storage.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Participant Views Their Registered Event via Personal Link (Priority: P1)

A participant who has registered for a running dinner receives a personal portal link in their registration confirmation email. When they follow that link, the portal opens and displays the event they signed up for, showing the event name, event date, and city. The event entry is also saved in the browser so it appears automatically on future visits.

**Why this priority**: This is the foundational use case — the reason the portal exists. Without this story, the portal has no value. It also establishes the credential storage mechanism needed by all other stories.

**Independent Test**: Can be fully tested by registering for an event, opening the combined confirmation+portal link from the received email, and verifying the event is confirmed and shown in the portal; then closing and reopening the browser to verify the event persists without the link.

**Acceptance Scenarios**:

1. **Given** a participant has registered for a running dinner and received the combined confirmation+portal email, **When** they open the link, **Then** their registration is confirmed and the portal displays the registered event with the event name, date, and city.
2. **Given** a participant's registration was already confirmed and they open the same portal link again, **When** the portal loads, **Then** the confirmation step is skipped silently (idempotent) and the event is displayed normally.
3. **Given** a participant has opened their portal link and their event is shown, **When** they close the browser and revisit the portal landing page (without the link), **Then** the event is still listed.
4. **Given** a participant opens a valid portal link, **When** the portal loads, **Then** only their own event data is visible — no other participants' or events' data is shown.
5. **Given** a participant who has registered for multiple events opens any of their portal links, **When** the portal loads, **Then** all events associated with their email address are displayed and their credentials stored — not only the single event for which that particular link was sent.

---

### User Story 2 — Participant Sees All Their Events on the Portal Landing Page (Priority: P2)

A participant who has registered for multiple running dinner events (or has visited their personal links for each event before) opens the portal landing page and sees all their registered events listed. Each event shows sufficient information to distinguish it from the others.

**Why this priority**: The aggregated event list is the portal's primary ongoing value — it replaces the need to keep individual access links bookmarked. This story directly depends on the credential storage from P1.

**Independent Test**: Can be fully tested by visiting two separate personal portal links (for two different events), then navigating to the portal landing page and verifying both events are listed.

**Acceptance Scenarios**:

1. **Given** a participant has previously accessed portal links for two different events on the same device, **When** they navigate to the portal landing page, **Then** both events are displayed in the event list.
2. **Given** a participant's event list is shown, **When** they select one event, **Then** they are taken to that event's portal view with all relevant details visible.
3. **Given** a participant visits the portal landing page on a device where they have never opened a portal link, **When** the page loads, **Then** an empty state is shown and the access recovery form is embedded inline on the same page.
4. **Given** a participant has credentials stored for an event that has since been deleted on the backend, **When** the portal landing page loads, **Then** that event does not appear in the list (live fetch returns no data; it is silently omitted).

---

### User Story 3 — "My Events" Navigation Entry on the Landing Page (Priority: P3)

A visitor on the public landing page of the application sees a "My Events" navigation entry. Clicking it opens the portal landing page. If events are already stored in the browser, the list is shown immediately. If no events are stored, an empty state is displayed together with the access recovery form embedded on the same page — so the user can request their portal link without any further navigation.

**Why this priority**: Without a navigation entry the portal is only accessible via direct links. The nav entry is the discovery point for all non-technical users and must be present for the portal to be usable as a product feature. The inline recovery form eliminates friction for first-time or new-device visitors.

**Independent Test**: Can be fully tested by visiting the public landing page, clicking "My Events" in the navigation, and verifying (a) events are shown when storage contains them, and (b) the empty state with inline recovery form is shown when storage is empty — all without extra navigation steps.

**Acceptance Scenarios**:

1. **Given** a visitor is on the public landing page, **When** they look at the main navigation, **Then** a "My Events" entry is visible.
2. **Given** a user clicks "My Events" and their browser has stored events, **When** the portal landing page loads, **Then** the event list is displayed.
3. **Given** a user clicks "My Events" and their browser has no stored events, **When** the portal landing page loads, **Then** an empty state is shown and the access recovery form is embedded inline on the same page — no button to a separate page is required.
4. **Given** the navigation is in the wizard flow or in the admin area, **When** the page renders, **Then** no "My Events" entry appears in the navigation.

---

### User Story 4 — User Recovers Portal Access on a New Device via Email (Priority: P4)

A user who visits the portal on a device where no events are stored (new browser, cleared storage) can submit their email address to receive a recovery link. When they click the link in that email, all events associated with their email — both events they registered for as a participant and events they created as an organizer — are restored to the portal in one step.

**Why this priority**: This is essential for usability when users lose browser storage or switch devices. Without it the portal events are permanently inaccessible unless the user kept the original per-event emails. It completes the access loop opened by P1 and P2.

**Independent Test**: Can be fully tested by visiting the portal on a fresh browser, entering a known registered email, receiving the recovery email, clicking the link, and verifying all the user's events appear in the portal.

**Acceptance Scenarios**:

1. **Given** a user is on a device with no portal events stored, **When** they submit their email address via the access recovery form, **Then** a single email is sent to that address containing one person-scoped portal recovery link.
2. **Given** the user clicks the recovery link from the email, **When** the portal opens, **Then** all events associated with that email (participant registrations and owned events) are stored in the browser and shown in the event list.
3. **Given** the submitted email address has no matching registrations or owned events, **When** the recovery form is submitted, **Then** the system responds with a generic confirmation message that does not reveal whether or not the address is registered.
4. **Given** a user submits the recovery form multiple times with the same email in quick succession, **When** the requests are processed, **Then** only one email is sent per reasonable time window to prevent abuse.

---

### User Story 5 — Event Organizer Sees Their Owned Events and Accesses Administration (Priority: P5)

An event organizer who has created one or more running dinner events visits the portal and sees their owned events listed alongside any events they may have registered for as a participant. For each owned event, a clearly labeled action allows them to jump directly to that event's administration area.

**Why this priority**: Organizers are a distinct and important user group. The portal can serve as a convenient launch point for their admin work. However, this is non-critical for the initial MVP — participants can use the portal without this story being implemented.

**Independent Test**: Can be fully tested by accessing a portal with organizer credentials and verifying the event list shows owned events, each with a working link to the admin area. The admin link navigates to the existing administration area. The access recovery flow (User Story 4) also covers organizers: clicking the recovery link must restore their owned events as well.

**Acceptance Scenarios**:

1. **Given** an organizer has created a running dinner and receives the combined confirmation+portal email, **When** they open the link, **Then** their email address is confirmed (idempotent) and the portal displays their owned event marked as an event they created.
2. **Given** an organizer clicks the combined confirmation+portal link after their email is already confirmed, **When** the portal loads, **Then** the confirmation step is skipped silently and the event is displayed normally with no error or warning.
3. **Given** an owned event is displayed in the portal, **When** the organizer selects the administration action for that event, **Then** they are navigated to the full event administration area. The event's published/activation state is unchanged by opening the portal link.
4. **Given** a regular participant (non-organizer) accesses the portal, **When** the event list is shown, **Then** no administration links or organizer-only actions are visible for any event.
5. **Given** an organizer who is also registered as a participant in a different event, **When** the portal shows their event list, **Then** their own events show an admin action, while events they joined as a participant do not.
6. **Given** an organizer uses the access recovery flow (User Story 4), **When** they click the recovery link, **Then** their owned events are restored to the portal including the administration action for each.

---

### User Story 6 — User Clears All Locally Stored Portal Data ("Forget Me on This Device") (Priority: P6)

A user who no longer wants their events stored on the current device (e.g., a shared or public computer) can trigger a "forget me on this device" action from within the portal. This removes all locally stored portal credentials from the browser without affecting any data on the server.

**Why this priority**: This is a privacy and security hygiene feature — it gives users control over their local data and is especially important on shared devices. It depends only on the browser storage mechanism established in P1.

**Independent Test**: Can be fully tested by storing events in the browser, triggering the "forget me" action, then navigating to the portal landing page and verifying the empty state with inline recovery form is shown and browser storage is empty.

**Acceptance Scenarios**:

1. **Given** a user has one or more events stored in the portal on their device, **When** they trigger the "forget me on this device" action, **Then** all locally stored portal credentials are removed from the browser.
2. **Given** the user has cleared local data, **When** they navigate to the portal landing page, **Then** the empty state and the inline access recovery form are shown, as if they had never used the portal on this device.
3. **Given** the "forget me on this device" action is triggered, **Then** no data is deleted or modified on the server — only the local browser storage is affected.
4. **Given** the user triggers the action, **When** the operation is complete, **Then** a confirmation is displayed indicating that locally stored portal data has been cleared.

---

### Edge Cases

- What happens when a portal access link is used by a different browser or device? — The event should be added to that device's local list and work independently of other devices; there is no cross-device synchronization. The access recovery flow is the intended mechanism for restoring events on a new device.
- What happens when a user with multiple events under one email uses access recovery? — One email is sent containing one person-scoped recovery link. Clicking it restores all events (participant and organizer) for that email in a single step.
- What happens if an event has already taken place? — Past events should still appear in the event list, clearly marked with their past date, but without any special handling in this phase.
- What happens when a participant clicks the combined confirmation+portal link after their registration is already confirmed? — Confirmation is skipped silently (idempotent); the portal opens and displays the event normally with no error or warning.
- What happens when a user clears their browser storage? — All stored events are lost. The user must use their personal link again or use the access recovery option to restore them.
- What happens if the same portal link is opened twice on the same device? — The event should appear only once in the event list (no duplicates).
- What happens when an organizer link is shared with someone else? — Since there is no traditional authentication, the portal will show the organizer view for anyone who has that link. The link should be treated as confidential; no additional enforcement is in scope for this phase.
- What happens if an event is deleted on the backend after a user has its credentials stored locally? — The event will not appear in the portal. The live backend fetch returns nothing for it and it is silently omitted from the displayed list. The stale credentials remain in browser storage but produce no visible entry.
- Should users revisit their portal link regularly for ongoing access? — No. The portal link is for initial access and recovery only. Normal ongoing use is via browser-stored credentials through the "My Events" navigation. The portal link does not need to be bookmarked.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST replace the existing double opt-in confirmation email for participants with a single combined email whose link both confirms **that specific event registration** (per-event, idempotent) and serves as the email-scoped portal access link. When the link is opened, the portal MUST display all events associated with the user's email address — not only the single event for which the link was sent.
- **FR-002**: The system MUST replace the existing event confirmation email for organizers with a single combined email whose link both confirms the organizer's **email address** for that specific event (per-event, double opt-in, idempotent) and serves as the email-scoped portal access link. When the link is opened, the portal MUST display all events associated with the organizer's email address. Clicking the link MUST NOT change the event's visibility or published/activation state.
- **FR-003**: When a user opens a personal portal link, the system MUST display the associated event with at minimum: event name, event date, and city.
- **FR-004**: When a user opens a personal portal link, the system MUST store the access credentials for all events resolved via that link in the current browser, so they can be retrieved on future visits without the link.
- **FR-005**: The portal landing page MUST display all events stored for the current browser/device, showing each event's name, date, and city.
- **FR-006**: The portal landing page MUST show a clear empty state when no events are stored in the current browser, with the access recovery form embedded inline on the same page (no separate page navigation required).
- **FR-006a**: A "My Events" navigation entry MUST appear in the main navigation of the public landing page. It MUST NOT appear in the wizard flow or in the administration area.
- **FR-007**: Each event entry for a portal visitor who is an organizer of that event MUST include a direct action to navigate to the event's administration area.
- **FR-008**: Portal event entries for participant-only registrations MUST NOT display any organizer or administration actions.
- **FR-009**: The system MUST ensure that a user can only view data belonging to their own registration; no other participants' data may be accessible.
- **FR-010**: The system MUST allow users to request portal access recovery via email: the user submits their email address, and the system sends one email containing a single person-scoped recovery link that — when clicked — restores all events associated with that email address (both participant registrations and owned events) into the browser's portal in a single step.
- **FR-011**: The access recovery email response MUST be a generic confirmation regardless of whether the email address is registered, to avoid leaking registration status.
- **FR-012**: The portal MUST always fetch event data live from the backend when displaying the event list. The browser stores only access credentials (identifiers); no local copy of event data is maintained. If an event cannot be retrieved from the backend (e.g., it has been deleted), it MUST be silently omitted from the displayed list with no error shown to the user.
- **FR-013**: The portal MUST provide a "forget me on this device" action that removes all locally stored portal credentials from the current browser. This action MUST NOT affect any server-side data. After the action completes, the portal MUST display the empty state with the inline access recovery form.

### Key Entities

- **Portal Event Entry**: Represents one event visible to a specific portal visitor. Contains event name, event date, city, and a role indicator (participant or organizer). For organizers, it also carries a reference to the event's administration area.
- **Portal Visitor**: A person accessing the portal, identified by their secret credentials (received via link). Can have two roles: *Participant* (registered for an event) and *Organizer* (created an event). A person may have both roles across different events.
- **Browser Event Store**: The per-device, per-browser collection of access credentials (identifiers) stored from previously opened portal links. Holds only the credentials needed to fetch event data — not a local copy of the event data itself. Scoped to the current browser; not synchronized across devices. Can be fully cleared by the user via the "forget me on this device" action.
- **Person-Scoped Recovery Link**: A special-purpose link, generated on demand via the access recovery form, that is tied to an email address rather than a single event. When clicked, it resolves all events (participant and organizer) for that email and restores them all into the browser's portal at once.

---

## Assumptions

- Portal links are **email-scoped**: one link per email address. When opened, a portal link resolves and displays all events (participant and organizer) for that email. The link is intended for initial access and recovery only — not for routine daily navigation.
- Confirmation triggered by a per-event portal link (FR-001, FR-002) is scoped to the specific event registration or creation that generated that email. The portal view the link opens is email-scoped (all events for that email).
- A portal link for organizers is derived from the existing administration credentials already provided to organizers when they create an event. No separate link generation is required.
- A portal link for participants is derived from the self-service credentials already associated with each participant registration.
- The organizer's combined link confirms their **email address only** (double opt-in). It does not activate, publish, or otherwise change the state of the event — that remains a separate admin action.
- Browser storage holds only access credentials, not cached event data. All displayed event data is fetched live from the backend.
- Events have a single organizer (the person who created it). Co-organizer scenarios are out of scope for this phase.
- No cross-device synchronization of stored events is in scope. Each device/browser maintains its own independent list.
- The access recovery flow (FR-010/FR-011) sends one email containing one person-scoped recovery link if a matching registration is found; the response is always a generic confirmation that does not reveal whether the address is registered.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A participant can view their registered event in the portal within 2 clicks of opening their personal portal link.
- **SC-002**: After opening a personal portal link once, a returning user can find their event in the portal landing page without using the link again on the same device.
- **SC-003**: An organizer can navigate from the portal event list to their event's administration area in a single click.
- **SC-004**: A user who has registered for multiple events and accessed each portal link at least once sees all their events aggregated in one view without repeating any.
- **SC-005**: A user on a new device who has lost their portal links can submit the access recovery form and, after clicking the single link in the received email, see all their events restored in the portal in a single step — no more than 5 minutes after form submission.
