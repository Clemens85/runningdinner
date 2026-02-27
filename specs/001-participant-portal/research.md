# Phase 0 Research: Participant Portal

**Branch**: `001-participant-portal` | **Date**: 2026-02-25

All items that were NEEDS CLARIFICATION in the Technical Context have been resolved. This document
records the decisions, rationale, and alternatives considered.

---

## 1. Portal Link Strategy — How Participants and Organizers Are Delivered Portal Access

### Finding

The current confirmation flows work as follows:

**Participants:**
- Trigger: `NewParticipantSubscribedEvent` published from `FrontendRunningDinnerService`
- Listener: `NewParticipantSubscribedMailListener` → `MessageService.sendSubscriptionActivationMail()`
- Formatter: `NewParticipantSubscribedFormatter.formatNewParticipantSubscribedMessage()`
- Current URL: `{host}/running-dinner-events/{publicId}/{participantId}/activate`
- Frontend handler: `ParticipantActivationPage` at route `running-dinner-events/:publicDinnerId/:participantId/activate`

**Organizers:**
- Trigger: `NewRunningDinnerEvent`
- Listener: `NewRunningDinnerListener` → `MessageService.sendRunningDinnerCreatedMessage()`
- Formatter: `RunningDinnerEventCreatedMessageFormatter`
- Current URL (confirm/acknowledge): `{host}/admin/{adminId}/{objectId}/acknowledge`

### Decision

All portal email links — whether sent to a new participant, a new organizer, or as a recovery
link — share one uniform URL shape:

```
{host}/my-events/{portalToken}
```

The `portalToken` is a persistent UUID tied to the person's email address (see Section 4). For
combined confirmation+portal links the URL also carries optional query parameters so the specific
registration can be confirmed on the same click:

| Actor | URL sent in email |
|---|---|
| Participant (new registration) | `{host}/my-events/{portalToken}?confirmPublicDinnerId={publicDinnerId}&confirmParticipantId={participantId}` |
| Organizer (event created) | `{host}/my-events/{portalToken}?confirmAdminId={adminId}` |
| Recovery link | `{host}/my-events/{portalToken}` (no query params) |

The `PortalActivationPage` frontend handler:
1. Calls `GET /rest/participant-portal/v1/token/{portalToken}` (passing query params if present) — the backend performs confirmation (idempotent) and returns all credential pairs for that email.
2. Stores all returned credentials in `localStorage`.
3. Navigates to `/my-events`.

**Backward compatibility**: The existing route `running-dinner-events/:publicDinnerId/:participantId/activate` still performs the participant activation (existing logic) but no longer provides portal access — users who follow an old-style link will see the activation success and then be prompted to use the recovery form to access the portal.

### Rationale

- URL is **opaque** — it carries no participant ID, dinner ID, or admin ID in the path; those appear only as confirmation hints in the query string. This makes the link shape stable across participant, organizer, and recovery flows.
- A single portal token per email address means **recovery and initial access are the same mechanism** — no separate recovery token entity needed.
- Confirmation query params are optional and idempotent — clicking the same link a second time silently skips confirmation and just opens the portal dashboard.

### Alternatives Considered

- **Embed IDs directly in the path** (`/my-events/participant/{publicDinnerId}/{participantId}`): Originally drafted but rejected because the link leaks credential IDs in the URL path (bookmarks, server logs, referrer headers) and requires a different URL shape per actor type.
- **Per-email link with no confirmation params, keep separate confirmation flow**: Cleaner separation but requires two clicks for the user (confirm → then access portal). Rejected because the spec requires one combined email.

---

## 2. Credential Storage Format in localStorage

### Finding

`LocalStorageService.ts` in `webapp/src/common/` provides `getFromLocalStorage` / `setToLocalStorage`
helpers. Existing keys use prefixes: `registration_`, `{key}_{adminId}`. No existing portal
credential storage exists.

### Decision

Store portal credentials as a single `localStorage` key: `runningdinner_portal_credentials`.

Value: a JSON-serialised `PortalCredential[]` array.

```typescript
// Types in shared/src/portal/PortalTypes.ts
type PortalRole = "PARTICIPANT" | "ORGANIZER";

interface ParticipantPortalCredential {
  role: "PARTICIPANT";
  selfAdminId: string;        // UUID — selfAdministrationId on RunningDinner
  participantId: string;      // UUID — Participant entity ID
}

interface OrganizerPortalCredential {
  role: "ORGANIZER";
  adminId: string;            // String — RunningDinner.adminId
}

type PortalCredential = ParticipantPortalCredential | OrganizerPortalCredential;
```

`PortalStorageService.ts` in `shared/src/portal/` wraps read/write/clear. No event data is cached.
When merging newly received credentials (e.g. reopening a portal link on a device that already has
some credentials), duplicates are eliminated by comparing the discriminating IDs (`participantId`
or `adminId`).

### Rationale

- One key per concern — easy to clear entirely for "forget me" action.
- Typed discriminated union avoids null checks on credential fields.
- Mirrors the design in [discovery/participant-portal-concept.md](../../discovery/participant-portal-concept.md).

### Alternatives Considered

- **One key per event** (`portal_participant_{participantId}`): Easier atomic updates per event
  but makes listing all events or bulk-clearing harder. Rejected.
- **`IndexedDB`**: Better for large/complex data but overkill for a list of token strings.
  Deferred to a later phase.

---

## 3. Backend Portal Access Endpoints — Credential Resolution

### Finding

The backend needs to resolve "give me all events for this email" from either:
- A `(publicDinnerId, participantId)` pair (participant flow)
- An `adminId` (organizer flow)
- A recovery token (recovery flow)

For the participant case: `Participant` entity has an `email` field. Given `participantId`, fetch the
participant, get email, then query all participants with that email across all dinners to collect all
`(selfAdministrationId, participantId)` pairs. Also query all `RunningDinner` records where the
organizer email matches (to cover organizer roles too).

For the organizer case: `RunningDinner` has `email` (organizer email). Given `adminId`, fetch
dinner, get email, run the same "all events for this email" query.

### Decision

New backend endpoints under `/rest/participant-portal/v1/`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/token/{portalToken}` | Resolve all credentials for the email tied to this token; optionally confirm a specific registration via query params |
| `POST` | `/my-events` | Accept list of credentials, return live event summaries |
| `POST` | `/access-recovery` | Accept email, look up/create portal token, send recovery email (generic response) |

All endpoints are in `ParticipantPortalServiceRest` and delegate to `ParticipantPortalService`.

The `GET /token/{portalToken}` endpoint accepts optional query parameters:
- `confirmPublicDinnerId` + `confirmParticipantId` → calls existing `activateSubscribedParticipant()` (idempotent)
- `confirmAdminId` → calls existing dinner acknowledgement logic (idempotent; email-confirm only)

### Rationale

- One token endpoint covers all three use cases (participant link, organizer link, recovery link) — the optional confirmation params fold per-event confirmation into the same request, eliminating separate actor-specific endpoints.
- Live event fetch (`POST /my-events`) remains separate from credential resolution — credentials are cheap to store, event data is always fetched fresh per spec.
- Generic recovery response from `POST /access-recovery` prevents email enumeration.

---

## 4. Portal Token Strategy

### Finding

The user clarification established that the portal link must be opaque (not containing user- or
event-specific IDs in the path) and that initial access and recovery must use the same mechanism.
This means a **dedicated portal token** is needed — generated once per email address, persisted
long-term, and reused for every portal link sent to that address.

### Decision

New JPA entity: `PortalToken`

```
portal_token
  id                           UUID PK
  email                        VARCHAR NOT NULL UNIQUE
  token                        UUID NOT NULL UNIQUE
  created_at                   TIMESTAMP NOT NULL
  last_recovery_email_sent_at  TIMESTAMP NULL        -- for rate limiting recovery emails
```

- **One token per email address** — created lazily on the first email sent to that address.
- Token is **persistent** (no expiry) — the same token is embedded in every portal link sent
  to that email, whether it is the initial confirmation email or a recovery email.
- Token is **not single-use** — clicking the link any number of times is safe (idempotent).
- Losing access to the token means losing access to the portal on that device; the recovery
  flow re-sends the *same* token link, not a new one.

### Rate Limiting for Recovery Emails

Because the token is permanent and reusable, rate limiting applies to **email sending only**, not
to token validity. `last_recovery_email_sent_at` on the `PortalToken` row is checked when
`POST /access-recovery` is called:
- If `last_recovery_email_sent_at` is within the last hour, no email is sent and the generic
  confirmation response is still returned.
- Otherwise, the email is sent and the field is updated.

This covers the anti-abuse requirement from the spec without any token rotation.

### Rationale

- **Single mechanism for access and recovery**: no need for a separate recovery token entity;
  the same `portal_token` row serves both purposes.
- **No expiry bookkeeping**: eliminates scheduled cleanup jobs and the edge case of a token
  expiring between the email send and the user clicking it.
- **Stable link**: organizers and participants can bookmark their portal link; it will always work.
- **Rate limiting at send time** is sufficient because the token URL itself is secret.

### Alternatives Considered

- **Short-lived token (24-hour TTL, single-use)**: Originally drafted; rejected because it forces
  users to act quickly and creates a new expiry problem — especially for organizers who might
  forward or re-open an email days later.
- **JWT signed token (stateless)**: No DB table needed, but requires secret key management and
  cannot be selectively revoked. Rejected.
- **Embed IDs in the URL path instead of a token**: Leaks credential IDs in URL path (bookmarks,
  logs, referrers); requires a different URL per actor type. Rejected.

---

## 5. My Events API — Live Event Fetch

### Finding

The spec requires all event data to be fetched live. The backend already exposes per-event data
through various service/REST layers. A new aggregation endpoint is cleaner than stitching individual
existing calls on the frontend.

### Decision

`POST /rest/participant-portal/v1/my-events` accepts a list of `PortalCredentialTO` objects.
For each credential, the service looks up the event and returns a `PortalEventEntryTO`:

```java
// Response per event
class PortalEventEntryTO {
    String eventName;          // RunningDinner.title
    LocalDate eventDate;       // RunningDinner.date
    String city;               // RunningDinner.city
    PortalRole role;           // PARTICIPANT or ORGANIZER
    String adminUrl;           // null for PARTICIPANT; populated for ORGANIZER
}
```

If a credential resolves to a deleted/unavailable event, it is silently omitted from the response.
The frontend drops any localStorage credential entry that returns no event data.

### Rationale

- Aggregating on the backend keeps the frontend simple — one call, one list.
- Silent omission of deleted events is required by FR-012.

---

## 6. Navigation and Routing Changes

### Finding

The current route structure has `LandingApp` as the catch-all (`/*`). The `LangingRoute.tsx` file
defines all landing app routes. Navigation items live in `MainNavigation` component(s) in
`webapp/src/common/mainnavigation/`.

### Decision

**New routes** added to `LangingRoute.tsx`:

| Path | Component | Purpose |
|---|---|---|
| `my-events` | `MyEventsPage` | Portal landing — event list or empty state + recovery form |
| `my-events/:portalToken` | `PortalActivationPage` | All portal links (participant, organizer, recovery) — same route, query params carry optional confirmation IDs |

**Backward-compat note**: Route `running-dinner-events/:publicDinnerId/:participantId/activate`
still renders the existing `ParticipantActivationPage` (confirms the registration) but no longer
grants portal access — old emails remain functional for confirmation but the user will need to
use the recovery form to populate the portal.

**Navigation**: "My Events" link added to the landing-area navigation only. It must NOT appear in
wizard (`/running-dinner-wizard/*`) or admin (`/admin/*`) areas — guarded by the existing app
boundary (each area has its own navigation component).

---

## 7. Email Formatter Modifications

### Finding

Both `NewParticipantSubscribedFormatter` and `RunningDinnerEventCreatedMessageFormatter` construct
URLs via `UrlGenerator`. New URL constants need to be added to `UrlGenerator` and
`application.properties`.

### Decision

Add two new URL templates to `application.properties`:
```properties
dinner.portal.url=${host.context.url}/my-events/{portalToken}
dinner.portal.participant.url=${dinner.portal.url}?confirmPublicDinnerId={publicId}&confirmParticipantId={participantId}
dinner.portal.organizer.url=${dinner.portal.url}?confirmAdminId={adminId}
```

`UrlGenerator` gains new methods:
- `constructPortalUrl(portalToken)` — base portal URL (used for recovery emails)
- `constructParticipantPortalUrl(portalToken, publicId, participantId)` — with confirmation params
- `constructOrganizerPortalUrl(portalToken, adminId)` — with confirmation params

Both formatters receive the `portalToken` by calling
`ParticipantPortalService.getOrCreatePortalToken(email)` before formatting the message.

The participant formatter replaces the activation-only link with the participant portal URL.
The organizer formatter replaces the acknowledge link with the organizer portal URL (the direct
admin link in the email body remains unchanged for convenience).

---

## 8. Email Confirmation Logic — Backend

### Finding

**Participant confirmation** currently calls `FrontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId)`.

**Organizer email confirmation** uses the acknowledge endpoint at `RunningDinnerServiceRest` — PATCH to `/runningdinner/{adminId}/{objectId}/acknowledge` which sets `emailConfirmed = true` on the dinner.

### Decision

Confirmation is handled inside the unified `GET /token/{portalToken}` endpoint via optional query
parameters:

- **`?confirmPublicDinnerId={id}&confirmParticipantId={id}`**: the service calls
  `FrontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId)`
  (existing, idempotent) before resolving credentials.
- **`?confirmAdminId={adminId}`**: the service calls the existing dinner email-acknowledgement
  logic (idempotent; does NOT change the event's published/activation state — per FR-002).

If neither confirmation parameter is present (recovery flow), the endpoint simply resolves
credentials without any confirmation side-effect.

---

## 9. "Forget Me" action

### Decision

`PortalStorageService.clearAll()` removes the `runningdinner_portal_credentials` key from
`localStorage`. `ForgetMeAction.tsx` shows a confirmation dialog before clearing, then navigates
to `/my-events` which will display the empty state. No server call is made.

---

## Summary of Resolved Clarifications

| Topic | Resolution |
|---|---|
| Portal link URL shape | `{host}/my-events/{portalToken}` — same shape for all actors and for recovery |
| Confirmation IDs in link | Query params: `?confirmPublicDinnerId=&confirmParticipantId=` or `?confirmAdminId=` |
| Portal token storage | New `PortalToken` JPA entity (`portal_token` table), `V2.11` migration; one row per email; permanent |
| Recovery mechanism | Same portal token as initial access — no separate recovery token entity |
| Rate limiting recovery emails | `last_recovery_email_sent_at` field on `PortalToken`; 1-hour cooldown per address |
| Credential localStorage key | `runningdinner_portal_credentials` (JSON array) |
| Credential type structure | Discriminated union: `ParticipantPortalCredential` / `OrganizerPortalCredential` |
| Event data fetching | `POST /rest/participant-portal/v1/my-events` — single aggregation call |
| Backward compat for old `/activate` links | Old route still confirms registration; no portal access — user uses recovery form |
| Organizer confirmation action | Email confirmation only via `?confirmAdminId` query param (idempotent; no event activation) |
