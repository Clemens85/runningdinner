# REST API Contract: Participant Portal

**Service root**: `/rest/participant-portal/v1`  
**Controller**: `ParticipantPortalServiceRest`  
**Branch**: `001-participant-portal`

---

## Endpoints

---

### GET `/token/{portalToken}`

**Purpose**: Resolve all portal credentials for the email address associated with this token.
Optionally performs an idempotent event confirmation on the same request if confirmation
query parameters are provided.

This is the target of **all** portal email links — participant confirmation emails, organizer
confirmation emails, and recovery emails all point here (same path shape, optional query params
distinguish confirmation context).

**Path parameters**:
| Name | Type | Description |
|---|---|---|
| `portalToken` | `String` | The portal token embedded in the email link (UUID + random string suffix, same format as `adminId`) |

**Optional query parameters** (only present in combined confirmation+portal emails):
| Name | Type | Description |
|---|---|---|
| `confirmPublicDinnerId` | `String` | Public event ID — triggers participant registration confirmation |
| `confirmParticipantId` | `UUID` | Participant ID — required together with `confirmPublicDinnerId` |
| `confirmAdminId` | `String` | Organizer admin ID — triggers organizer email confirmation |

At most one confirmation context is valid per request (`confirmPublicDinnerId`+`confirmParticipantId`
**or** `confirmAdminId`, never both).

**Response `200 OK`**:
```json
{
  "credentials": [
    {
      "role": "PARTICIPANT",
      "selfAdminId": "550e8400-e29b-41d4-a716-446655440000",
      "participantId": "a0b1c2d3-e4f5-6789-ab01-234567890abc"
    },
    {
      "role": "ORGANIZER",
      "adminId": "org-1234-abcd"
    }
  ]
}
```

Returns **all** credential pairs (PARTICIPANT and ORGANIZER) for all events associated with the
email address tied to the portal token.

**Response `404 Not Found`**: Token does not exist.

**Notes**:
- If confirmation params are present, the corresponding confirmation is performed first
  (idempotent — safe to call multiple times without side effects beyond the first call).
- Organizer confirmation (`confirmAdminId`) confirms the email address only; it does NOT activate
  or publish the event (FR-002).
- If confirmation params are absent (plain portal access or recovery), no confirmation
  side-effect occurs — credentials are resolved and returned as-is.

---

### POST `/my-events`

**Purpose**: Accept a list of portal credentials and return live event summaries for all
resolvable events.

**Request body**:
```json
{
  "credentials": [
    {
      "role": "PARTICIPANT",
      "selfAdminId": "550e8400-e29b-41d4-a716-446655440000",
      "participantId": "a0b1c2d3-e4f5-6789-ab01-234567890abc"
    },
    {
      "role": "ORGANIZER",
      "adminId": "org-1234-abcd"
    }
  ]
}
```

**Response `200 OK`**:
```json
{
  "events": [
    {
      "eventName": "Running Dinner Münster 2026",
      "eventDate": "2026-05-15",
      "city": "Münster",
      "role": "PARTICIPANT",
      "adminUrl": null
    },
    {
      "eventName": "Running Dinner Berlin 2026",
      "eventDate": "2026-06-20",
      "city": "Berlin",
      "role": "ORGANIZER",
      "adminUrl": "https://runningdinner.example.com/admin/org-1234-abcd"
    }
  ]
}
```

**Behavior**:
- Events that cannot be resolved (deleted, ID mismatch) are **silently omitted** — no error
  is returned (FR-012).
- Empty credentials list → `events: []`.

---

### POST `/access-recovery`

**Purpose**: Look up (or create) the portal token for the submitted email address and send a
recovery email containing the portal link, if at least one event is associated with that address.

**Request body**:
```json
{
  "email": "user@example.com"
}
```

**Response `200 OK`** (always — regardless of whether the email is registered):
```json
{
  "message": "If this email address is associated with any events, a recovery link has been sent."
}
```

**Rate limiting / anti-abuse**:
- If `last_recovery_email_sent_at` on the `PortalToken` row is within the last hour, no email
  is sent and the field is not updated. The same generic `200 OK` response is returned.
- If no `PortalToken` row exists for this email, a row may be created but no email is sent
  (there are no events). Response is still generic `200 OK`.

**Recovery link sent in email** (no confirmation params — plain portal access):
```
{host}/my-events/{portalToken}
```

**Notes**:
- Response is intentionally generic to prevent email enumeration (FR-011).
- The portal token is **persistent** — the same token that was used in the initial confirmation
  email is reused in the recovery email. No new token is generated.

---

## Email Link Formats

### Participant Registration Confirmation Email

| Before | After |
|---|---|
| `{host}/running-dinner-events/{publicId}/{participantId}/activate` | `{host}/my-events/{portalToken}?confirmPublicDinnerId={publicId}&confirmParticipantId={participantId}` |

The `portalToken` is retrieved (or created) via `ParticipantPortalService.getOrCreatePortalToken(participant.email)`.

### Organizer Event Creation Email

| Link | Before | After |
|---|---|---|
| Confirmation/portal link | `{host}/admin/{adminId}/{objectId}/acknowledge` | `{host}/my-events/{portalToken}?confirmAdminId={adminId}` |
| Admin management link | `{host}/admin/{adminId}` | **unchanged** |

The `portalToken` is retrieved (or created) via `ParticipantPortalService.getOrCreatePortalToken(organizer.email)`.

---

## Frontend Routes (summary)

| Path | Handler component | Triggered by |
|---|---|---|
| `/my-events` | `MyEventsPage` | "My Events" nav / direct navigation |
| `/my-events/:portalToken` | `PortalActivationPage` | All portal links (participant, organizer, recovery) — token in path, optional confirmation IDs in query string |
| `/running-dinner-events/:publicDinnerId/:participantId/activate` | `ParticipantActivationPage` (existing) | Old email links — still confirms registration but does not grant portal access |
