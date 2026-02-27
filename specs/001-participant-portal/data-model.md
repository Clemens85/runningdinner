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
[user clicks any portal link]   → GET /token/{token} → credentials resolved (no row change)
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

### `PortalCredentialTO` (request, inbound)

Used in `POST /my-events` body and returned from portal access + recovery endpoints.

```java
// Discriminated by `role` field
public class PortalCredentialTO {
    private PortalRole role;       // PARTICIPANT | ORGANIZER
    private String selfAdminId;    // UUID string — required when role = PARTICIPANT
    private String participantId;  // UUID string — required when role = PARTICIPANT
    private String adminId;        // String — required when role = ORGANIZER
}
```

### `PortalMyEventsRequestTO`

```java
public class PortalMyEventsRequestTO {
    private List<PortalCredentialTO> credentials;
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

### `PortalAccessResponseTO`

Returned by `GET /token/{portalToken}` and is also the shape returned by
`GET /access-recovery/{token}` (removed; both cases now use the single token endpoint).

```java
public class PortalAccessResponseTO {
    private List<PortalCredentialTO> credentials;  // all credentials for the email
}
```

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

export interface ParticipantPortalCredential {
  role: "PARTICIPANT";
  selfAdminId: string;        // UUID — matches RunningDinner.selfAdministrationId
  participantId: string;      // UUID — Participant.id
}

export interface OrganizerPortalCredential {
  role: "ORGANIZER";
  adminId: string;            // RunningDinner.adminId
}

export type PortalCredential = ParticipantPortalCredential | OrganizerPortalCredential;

export interface PortalEventEntry {
  eventName: string;
  eventDate: string;          // ISO date string (LocalDate serialized)
  city: string;
  role: PortalRole;
  adminUrl: string | null;    // null for participants
}
```

---

## Frontend — Browser Storage Model

**Key**: `runningdinner_portal_credentials`  
**Store**: `localStorage`  
**Value type**: `PortalCredential[]` serialized as JSON  
**Library**: Wrapped by `PortalStorageService.ts` in `shared/src/portal/`

```typescript
// PortalStorageService.ts public interface
export function getStoredCredentials(): PortalCredential[];
export function mergeCredentials(incoming: PortalCredential[]): void;
  // Adds new credentials; deduplicates by (selfAdminId+participantId) or adminId
export function clearAllCredentials(): void;
  // Used by "forget me on this device" — removes the storage key entirely
```

**Deduplication key**:
- `PARTICIPANT`: composite of `selfAdminId + participantId`
- `ORGANIZER`: `adminId`

**No event data is persisted.** The `PortalEventEntry[]` objects returned by `POST /my-events` are
held in React Query cache only and are always re-fetched on page load.
