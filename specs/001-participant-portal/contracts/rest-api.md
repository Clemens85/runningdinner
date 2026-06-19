# REST API Contract: Participant Portal

**Service root**: `/rest/participant-portal/v1`  
**Controller**: `ParticipantPortalServiceRest`  
**Branch**: `001-participant-portal`

---

## Endpoints

---

### GET `/token/{portalToken}`

**Purpose**: Validate that the portal token exists. **No side effects** — confirmation is
deliberately absent from this endpoint so that email link-preview scanners and security bots
(which issue GET requests to every URL in an email before the user clicks) cannot trigger
participant or organizer confirmation without user intent.

This is the initial GET that the browser performs when the user clicks a portal email link.
All portal email links point here (same path, no query params on the GET). After validation
the frontend issues a separate POST to `/confirm` if confirmation is required.

**Path parameters**:
| Name | Type | Description |
|---|---|---|
| `portalToken` | `String` | The portal token embedded in the email link |

**Response `204 No Content`**: Token is valid. No body.

**Response `404 Not Found`**: Token does not exist.

---

### POST `/token/{portalToken}/confirm`

**Purpose**: Perform an idempotent event confirmation (participant activation or organizer
email acknowledgement). Separated from the GET so only real browser JavaScript — not
email scanner bots — can trigger this side effect.

**Path parameters**:
| Name | Type | Description |
|---|---|---|
| `portalToken` | `String` | The portal token |

**Request body** (all fields optional — only the relevant ones are sent):
```json
{
  "confirmPublicDinnerId": "some-public-dinner-id",
  "confirmParticipantId": "a0b1c2d3-e4f5-6789-ab01-234567890abc",
  "confirmAdminId": null
}
```

At most one confirmation context is valid per request:
- `confirmPublicDinnerId` + `confirmParticipantId` → participant registration confirmation
- `confirmAdminId` → organizer email confirmation

**Response `204 No Content`**: Confirmation performed (or was already done — idempotent).

**Response `404 Not Found`**: Token does not exist.

**Notes**:
- Confirmation is idempotent — safe to call multiple times; subsequent calls after the first
  are no-ops.
- Organizer confirmation (`confirmAdminId`) sets the acknowledged date only; it does NOT
  activate or publish the event (FR-002).

---

### POST `/my-events`

**Purpose**: Accept the portal token and return live event summaries for all events associated
with the email address bound to that token. The token is the only credential the frontend
holds — no raw `adminId`, `selfAdminId`, or `participantId` values are stored in or sent from
the browser.

**Request body**:
```json
{
  "portalToken": "550e8400-e29b-41d4-a716-446655440000-aB3kZ"
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

**Response `404 Not Found`**: Token does not exist.

**Behavior**:
- Events that cannot be resolved (deleted, ID mismatch) are **silently omitted** — no error
  is returned (FR-012).
- The backend resolves all events for the email bound to the token server-side; the client
  never submits individual credential IDs.

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

The confirmation params are passed as query strings so they survive email forwarding and plain-text
display. When the page loads, the frontend:
1. Calls `GET /token/{portalToken}` to validate (no side effects).
2. Calls `POST /token/{portalToken}/confirm` with `{confirmPublicDinnerId, confirmParticipantId}` in the body.

This two-step split prevents email scanner bots from triggering confirmation via the GET prefetch.

### Organizer Event Creation Email

| Link | Before | After |
|---|---|---|
| Confirmation/portal link | `{host}/admin/{adminId}/{objectId}/acknowledge` | `{host}/my-events/{portalToken}?confirmAdminId={adminId}` |
| Admin management link | `{host}/admin/{adminId}` | **unchanged** |

The `portalToken` is retrieved (or created) via `ParticipantPortalService.getOrCreatePortalToken(organizer.email)`.

Same two-step split applies: the page first GETs to validate, then POSTs `{confirmAdminId}` to confirm.

---

## Frontend Routes (summary)

| Path | Handler component | Triggered by |
|---|---|---|
| `/my-events` | `MyEventsPage` | "My Events" nav / direct navigation |
| `/my-events/:portalToken` | `PortalActivationPage` | All portal links (participant, organizer, recovery) — token in path, optional confirmation IDs in query string |
| `/running-dinner-events/:publicDinnerId/:participantId/activate` | `ParticipantActivationPage` (existing) | Old email links — still confirms registration but does not grant portal access |
