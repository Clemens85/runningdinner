# Data Model: Participant Portal

**Branch**: `001-participant-portal` | **Date**: 2026-02-25

---

## Backend — JPA Entities

### New Entity: `PortalToken`

Persists a long-lived, email-scoped portal access token. One row per email address. Created the
first time a portal email is sent to that address; reused for every subsequent portal link (initial
access and recovery use the same token).

```java
// org.runningdinner.portal.PortalToken
@Entity
@Table(name = "portal_token")
public class PortalToken extends AbstractEntity {  // or plain @Entity with @Id

    @Column(nullable = false, unique = true)
    private String email;                             // One row per email address

    @Column(nullable = false, unique = true)
    private String token;                             // UUID + random string suffix (same format as adminId) — embedded in portal links

    @Column(name = "last_recovery_email_sent_at")
    private LocalDateTime lastRecoveryEmailSentAt;    // Null until first recovery email sent
}
```

**Relationships**: None — standalone entity.

**Validation rules**:
- `email` must be non-null, non-blank, and unique (DB unique constraint).
- `token` must be non-null, non-blank, and unique (DB unique constraint). Format: UUID + random string suffix, same generation strategy as `adminId`.
- Only one row per email address ever exists; `getOrCreate` semantics in the service.

**Lifecycle**:
```
[first portal email to address] → row created (token generated)
        ↓
[every subsequent portal email] → same row reused, same token embedded in link
        ↓
[user clicks any portal link]   → GET /token/{token}    → token validated (no row change)
                                   POST /token/{token}/confirm → confirmation performed if params present
                                   frontend stores token string in localStorage
        ↓
[user opens /my-events]         → POST /my-events {portalToken} → events resolved server-side
        ↓
[user requests recovery email]  → POST /access-recovery → email sent (if cooldown elapsed)
                                   → last_recovery_email_sent_at updated
```

Tokens are never deleted or rotated automatically; there is no expiry.

---

### Flyway Migration: `V2.11__AddPortalToken.sql`

```sql
CREATE TABLE portal_token (
    id                           UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email                        TEXT         NOT NULL,
    token                        TEXT         NOT NULL,
    created_at                   TIMESTAMP    NOT NULL,  -- inherited from AbstractEntity
    modified_at                  TIMESTAMP    NOT NULL,  -- inherited from AbstractEntity
    last_recovery_email_sent_at  TIMESTAMP    NULL,
    CONSTRAINT uq_portal_token_email  UNIQUE (email),
    CONSTRAINT uq_portal_token_token  UNIQUE (token)
);
```

---

## Backend — Transfer Objects (DTOs)

### `PortalConfirmRequestTO` (request body for POST `/token/{portalToken}/confirm`)

```java
public class PortalConfirmRequestTO {
    private String confirmPublicDinnerId;  // required for participant confirmation
    private UUID   confirmParticipantId;   // required for participant confirmation
    private String confirmAdminId;         // required for organizer confirmation
    // all fields optional; at most one confirmation context per request
}
```

### `PortalMyEventsRequestTO` (request body for POST `/my-events`)

```java
public class PortalMyEventsRequestTO {
    @NotBlank @Size(max = 128)
    private String portalToken;   // the only credential the frontend holds
}
```

### `PortalEventEntryTO` (response, outbound)

One entry per visible event in the portal.

```java
public class PortalEventEntryTO {
    private String eventName;      // RunningDinner.title
    private LocalDate eventDate;   // RunningDinner.date
    private String city;           // RunningDinner address city
    private PortalRole role;       // PARTICIPANT | ORGANIZER
    private String adminUrl;       // null for PARTICIPANT; full admin URL for ORGANIZER
}
```

> **Note**: `PortalCredentialTO` exists as an internal backend helper used between service
> methods. It is **not** part of the REST API contract and is not sent to or received from
> the frontend.

> **Note**: `PortalAccessResponseTO` was removed — the token endpoint returns `204 No Content`
> and the frontend stores the token string it already has from the URL.

### `PortalRole` (enum)

```java
public enum PortalRole {
    PARTICIPANT,
    ORGANIZER
}
```

---

## Existing Entities — Read-Only Usage (no schema changes)

| Entity | Fields used | Purpose |
|---|---|---|
| `RunningDinner` | `adminId`, `selfAdministrationId`, `title`, `date`, `city (via address)`, `emailConfirmed`, `organizer.email` | Resolve credential → event data; organizer email lookup |
| `Participant` | `id`, `email`, `activated` | Participant credential lookup; email-based cross-event search |

No structural changes to these entities. The portal service queries them via existing repositories
(`RunningDinnerRepository`, `ParticipantRepository`).

---

## Frontend — TypeScript Types

Located in `runningdinner-client/shared/src/portal/PortalTypes.ts`.

```typescript
export type PortalRole = "PARTICIPANT" | "ORGANIZER";

export interface PortalEventEntry {
  eventName: string;
  eventDate: string;          // ISO date string (LocalDate serialized)
  city: string;
  role: PortalRole;
  adminUrl: string | null;    // null for participants
}

export interface PortalMyEventsResponseTO {
  events: PortalEventEntry[];
}
```

> **Note**: `ParticipantPortalCredential`, `OrganizerPortalCredential`, `PortalCredential`,
> and `PortalAccessResponseTO` were removed from the frontend types. The frontend never holds
> or transmits raw `adminId`, `selfAdminId`, or `participantId` values — only the `portalToken`
> string.

---

## Frontend — Browser Storage Model

**Key**: `runningdinner_portal_token`  
**Store**: `localStorage`  
**Value type**: Plain `string` (the portal token)  
**Library**: Wrapped by `PortalStorageService.ts` in `shared/src/portal/`

```typescript
// PortalStorageService.ts public interface
export function getStoredPortalToken(): string | null;
export function storePortalToken(token: string): void;
  // Overwrites any existing token (one token per browser covers all events for the email)
export function clearStoredPortalToken(): void;
  // Used by "forget me on this device" — removes the storage key entirely
```

**Design rationale**: The `portalToken` is the sole session credential for the portal.
Storing only the token (not the individual `adminId`/`selfAdminId`/`participantId` values)
limits localStorage exposure — a credential that grants portal read-only access through a
revocable token is significantly less dangerous than a permanently valid `adminId` that grants
full event administration.

**No event data is persisted.** The `PortalEventEntry[]` objects returned by `POST /my-events` are
held in React Query cache only and are always re-fetched on page load.
