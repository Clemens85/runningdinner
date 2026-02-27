# Quickstart: Participant Portal

**Branch**: `001-participant-portal`

This guide describes how to build, run, and manually verify the Participant Portal feature during
development.

---

## Prerequisites

- PostgreSQL running on `localhost:5432/runningdinner` (see `application-dev.properties`)
- Java 21 SDK on PATH
- Node.js + pnpm (see `runningdinner-client/README.md`)
- Local SMTP mock or Mailjet sandbox credentials in `application-dev.properties`

---

## 1. Start the Backend

```bash
cd runningdinner-backend
./mvnw package -DskipTests
java -jar -Dspring.profiles.active=dev,demodinner,webpack target/runningdinner-2.0.0.jar
```

Flyway migration `V2.11__AddPortalToken.sql` runs automatically on startup.

Verify migration applied:
```sql
-- psql
\d portal_token
```

---

## 2. Start the Frontend

```bash
cd runningdinner-client
pnpm install
pnpm -r run dev
```

The Vite dev server starts at `http://localhost:5173`. Requests to `/rest/**` proxy to the backend
on port `9090`.

---

## 3. Manual Verification Flows

### Flow A — Participant: Combined Confirmation + Portal Entry

1. Register for an existing open running dinner event on the public event list page.
2. Check the received email (dev mailbox / MailHog / Mailjet sandbox).
3. The email now contains one link: the participant portal URL  
   `http://localhost:5173/my-events/participant/{publicDinnerId}/{participantId}`
4. Click the link. The `PortalActivationPage` opens, confirms the registration, and  
   navigates to `/my-events` showing the event.
5. Close the browser tab, open `/my-events` directly — the event is still listed  
   (credentials persisted in `localStorage`).

### Flow B — Organizer: Combined Confirmation + Portal Entry

1. Create a new running dinner via the wizard.
2. Open the received event creation email.
3. The email contains a portal URL:  
   `http://localhost:5173/my-events/organizer/{adminId}`
4. Click the link. The email is confirmed (idempotent), portal opens, event shown with  
   "Manage event" action.
5. Click "Manage event" — verify it navigates to the admin area for that dinner.

### Flow C — My Events Navigation (Empty State + Recovery)

1. Open a fresh browser profile (no localStorage data).
2. Navigate to the public landing page.
3. See "My Events" in the main navigation (must not appear in admin or wizard areas).
4. Click "My Events" — empty state + access recovery form are shown inline.
5. Enter a known registered email and submit.
6. Check the received recovery email — one link:  
   `http://localhost:5173/my-events/recover/{token}`
7. Click the link — all events for that email appear in the portal + stored in localStorage.

### Flow D — Forget Me on This Device

1. With events stored in the portal, find the "Forget me on this device" action.
2. Confirm the dialog.
3. Portal is cleared; empty state + recovery form are shown.
4. Inspect `localStorage` in browser DevTools — `runningdinner_portal_credentials` key absent.

### Flow E — Backward Compatibility Check

1. Use an old-format activation link:  
   `http://localhost:5173/running-dinner-events/{publicDinnerId}/{participantId}/activate`
2. Verify it redirects to the new participant portal URL and the portal loads correctly.

---

## 4. Running Tests

### Backend unit + integration tests

```bash
cd runningdinner-backend
./mvnw test
```

Key test class to check: `ParticipantPortalServiceTest` (Spring `@ApplicationTest`).

### Frontend unit tests

```bash
cd runningdinner-client
pnpm test
```

Key test files:
- `shared/src/portal/PortalStorageService.test.ts`
- `shared/src/portal/PortalService.test.ts`
- `webapp/src/landing/portal/MyEventsPage.test.tsx`

### E2E Tests

```bash
cd e2e-tests
./run-headless.sh
# or interactive:
npx cypress open
```

The E2E tests for this feature cover User Stories 1–6 (see spec acceptance scenarios).

---

## 5. Key URLs (local dev)

| URL | Purpose |
|---|---|
| `http://localhost:5173/my-events` | Portal landing page |
| `http://localhost:5173/my-events/participant/{publicDinnerId}/{participantId}` | Participant portal link |
| `http://localhost:5173/my-events/organizer/{adminId}` | Organizer portal link |
| `http://localhost:5173/my-events/{portalToken}` | Portal entry / recovery (same URL shape) |
| `http://localhost:9090/rest/participant-portal/v1/` | Backend API root |

---

## 6. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Flyway error on startup | `portal_token` table already exists | Drop the table and re-run, or mark migration as resolved |
| Email not received in dev | `mail.dev.mode=mock` not configured | Check `application-dev.properties` mail settings |
| Portal shows "no events" after clicking link | Credentials not stored | Open browser DevTools → Application → localStorage and check `runningdinner_portal_credentials` |
| Recovery email not sending | Rate limit applied (cooldown active) | Check `last_recovery_email_sent_at` in `portal_token` for that email |
