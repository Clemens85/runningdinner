# Custom Team Names – Implementation Plan

Status: FINAL (all decisions incorporated, ready to implement; no code written yet)

## 1. Goal

Teams are currently identified only by their number (`Team 1`, `Team 2`, …, i18n key `team` = `"Team {{ teamNumber }}"`).
Introduce an **optional, custom team name** (e.g. "Die Gourmets"):

- Admins can set/change/clear it (team details; team list shows only the number to save space).
- Participants can set/change/clear it for their own team via a **self-service link** (same mechanism as "change team host"): reachable from the team mail (placeholder) and from the self-service portal.
- Shown in: admin team details/schedule/dinner route views, participant dinner route views, dinner route mails (optional placeholder), team-related dialogs.
- **Fallback in admin views**: `Team {nr}` if no custom name is set (admin needs a unique handle).
- **Dinner route views (admin and participants)**: the custom name alone (`NAME_OR_NUMBER`, shortened to 14 characters with "..."); `Team {nr}` if there is no name. Mails: `{teamname}` is empty if there is no name.
- Editing by participants is **automatically blocked once dinner route mails were sent**.

Non-goals (explicitly ignored for now): behaviour when swapping *individual team members* between teams (`swapTeamMembers`) – the name stays with the `Team` entity there.

## 2. Decisions (from review)

| # | Decision |
|---|---|
| D1 | `{teamname}` is an **optional placeholder** in mails; default/saved templates are not altered (exception: see 4.5, new self-service link placeholder in the default TEAM mail text, new dinners only). |
| D2 | Editing is **blocked after dinner route mails were sent** (`DINNERROUTE_MAIL_SENT` activity exists – same check used in `ParticipantPortalService`). Enforced in backend; UI hides/disables the action and shows an info text. **Confirmed:** the block applies to the participant self-service only; the admin can still edit (e.g. to remove an inappropriate name) – the name is then only reflected in the live dinner route views, not in already sent mails. |
| D3 | **Activity-log entry** for every name change (by admin or participant). |
| D4 | **Self-service link** for team-name change, analogous to host change: new URL template, new placeholder `{managenamelink}` for the TEAM mail, new route/page in webapp `self/`, and button in the portal `MyTeamSection` that links to the page (like `manageTeamHostingUrl`). No inline editing in the portal. |
| D5 | **Validation**: max **48** chars; allowed: letters of any language (incl. umlauts/accents, via Unicode `\p{L}` + combining marks `\p{M}`), digits (`\p{N}`), space, and `! ? _ - . ' / &` (**confirmed**). No emojis, no other special chars/HTML (`<`, `>`, `"`, `\`, `%`, `$`, … rejected). Trimmed, inner whitespace collapsed, Unicode-NFC normalized, blank → no name. Validated only in the backend (the client shows the returned field issue). `'` is included because of names like "Hugo's Helden"; the character set is a single constant so it is easy to extend. Note: `&` and `'` are HTML-significant → output escaping in mails/activity messages is mandatory (see 7). |
| D6 | **Admin team list** keeps showing only the number. The name is shown in team details (header), team schedule/meeting plan, dinner route views and dialogs; in the list at most as tooltip on the number cell (see 4.7). |

## 3. Key findings from codebase analysis

| Topic | Finding |
|---|---|
| Entity | [Team.java](../runningdinner-backend/src/main/java/org/runningdinner/participant/Team.java): `teamNumber` (not null), `mealClass`, `teamMembers`, `status`. No name. |
| Flyway | Latest migration is `V2.12__AddParticipantAccessibility.sql`; tables live in schema `runningdinner` (`ALTER TABLE runningdinner.team …`). |
| TOs | `TeamTO` (admin + self `/team`), `DinnerRouteTeamTO` (admin + self dinner route, distance variants), `TeamSelfServiceInfo` (portal "My team" card). |
| Host-change link (blueprint for D4) | `UrlGenerator.constructManageTeamHostUrl` + property `dinner.team.managehost.url=${dinner.self.url}/teamhost/{participantId}/{teamId}`; placeholder `{managehostlink}` replaced in `TeamArrangementMessageFormatter` (TEAM mail) and `TeamHostChangedFormatter`; webapp route `:selfAdminId/teamhost/:participantId/:teamId` in `SelfAdminRoute.tsx` → `SelfAdminChangeTeamHostPage.tsx`; REST `PUT /rest/self/v1/{selfAdminId}/{participantId}/{teamId}/teamhost` (`SelfAdminServiceRest` → `SelfAdminService.changeTeamHost`, emits event → activity); portal `TeamSelfServiceInfo.manageTeamHostingUrl`. |
| Route-mails-sent check | `ParticipantPortalService` uses `activityService.findActivitiesByTypes(adminId, ActivityType.DINNERROUTE_MAIL_SENT)`. Same check for D2. |
| Mail formatting | `DinnerRouteMessageFormatter` builds `{route}` from `selfTemplate` / `hostsTemplate` (placeholders `{meal}`, `{firstname}`, `{lastname}`, `{mealtime}`, `{hostaddress}`, `{mobilenumber}`, `{mealspecifics}`); team number is **not** used in mails today. Placeholder constants in `FormatterUtil`. Template defaults in `shared/src/admin/MessageService.ts`, placeholder buttons in `webapp/src/admin/messages/MessagesContainer.tsx`. |
| Mail HTML | `FormatterUtil.getHtmlFormattedMessage` does **not** HTML-escape. Names must be escaped on insertion – required, not just defense in depth, since `&` and `'` are allowed. |
| Meal swap | `TeamService.swapMeals` swaps the **team members** between two `Team` entities (meal + teamNumber stay on entity). Name belongs to the group of people → swap together with members. |
| Waiting-list regeneration | `dropTeamAndAndVisitationPlans(gatherTeamRestoreInformation=true)` → `TeamTO.convertTeamList` → `RunningDinnerCalculator.assignRandomMealClasses(..., existingTeamsToKeep)` re-matches by `teamNumber`. Names must be restored here. |
| Full re-creation | `dropAndReCreateTeamAndVisitationPlans` without restore info → names intentionally lost. |
| Activities | `ActivityService` builds German messages with `Team {teamNumber}`; `ActivityType` enum; host change by participant has its own event + listener (blueprint for D3). |
| Admin list layout | `TeamRow.jsx`: columns number, members, seats, gender, meal, host, partner-wish. `TeamDetails.tsx` header uses `<TeamNr {...team} />`. |
| Frontend label helpers | `shared/src/TeamNr.jsx`, `shared/src/admin/teams/TeamNameHook.js` (`useTeamName`), `TeamNameMembersHook.ts`; hard-coded `Team #{team.teamNumber}` in `webapp/src/common/dinnerroute/DinnerRouteComponents.tsx`, `TeamSchedule.jsx`, `SwapMealsDialog.tsx`, `TeamCancelDialog.tsx`, `WaitingListManagementDialog.tsx`, hostlocations pages. |
| Optimization service | `TeamReference` / optimization request use team numbers only → **no change**. |

## 4. Design

1. **Storage**: nullable `teamName varchar(48)` on `Team` (null == no custom name). No uniqueness constraint.
2. **Single normalization/validation point (backend)**: `TeamNameValidator`/util (`normalize(String) → String|null`, `isValid`) using Java `Pattern` `^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} _!?.'/&-]{0,47}$` (first char must be a letter/digit, so names can't start with punctuation; the character class is built from one constant) after trim/collapse/NFC. Used by `TeamService.updateTeamName`; Invalid input → `ValidationException` with new `IssueKeys` entry (translated in frontend). **No client-side validation** (project strategy: validate only in the backend): the issue carries the field name `teamName`, so `applyValidationIssuesToForm` shows the translated message (`team_name_invalid`) at the form field.
3. **Single label source**: backend `Team#getTeamName()` + `FormatterUtil` helper (escaped name or `""`); frontend one helper `getTeamLabel(team, { fallbackToNumber })` used by `TeamNr`/`useTeamName`.
4. **Who may edit**: admin via adminId (`@ValidateAdminId`); participant via selfAdminId + participantId + teamId (membership check as in `SelfAdminService.buildSelfAdminContext`), not cancelled, and only while no `DINNERROUTE_MAIL_SENT` activity exists (D2). Last write wins.
5. **Meal swap** swaps `teamName` with the members; **waiting-list restore** copies `teamName`.

## 5. Work breakdown

### 5.1 Backend – persistence & domain
- [ ] Flyway `V2.13__AddTeamName.sql`: `ALTER TABLE runningdinner.team ADD COLUMN teamName varchar(64);` (still 64 in the script created so far; to be adapted to 48 by the project owner)
- [ ] `Team`: field `teamName`, getter, setter (`TeamAccessor` if required), `hasTeamName()`.
- [ ] `TeamNameUtil`/validator (design point 2) incl. unit tests with example table.
- [ ] `TeamService.swapMeals`: swap the two names.
- [ ] `RunningDinnerCalculator.assignRandomMealClasses` restore path: set `teamName` from `TeamTO existingTeam`.
- [ ] `TeamService.updateTeamName(adminId, teamId, rawName)`: `@Transactional`, normalize/validate, persist, emit event (D3). Shared by admin and self-service paths.

### 5.2 Backend – REST / TOs
- [ ] `TeamTO`: `teamName`; `DinnerRouteTeamTO`: `teamName` (flows into self + admin dinner routes and distance variants); verify `TeamMeetingPlanTO`/`HostTeamTO`.
- [ ] `TeamSelfServiceInfo`: `teamName`, `manageTeamNameUrl`, `teamNameChangeAllowed` (false once route mails sent) – populated in `ParticipantPortalService.resolveTeamSelfServiceInfo`.
- [ ] Admin: `PUT /rest/teamservice/v1/runningdinner/{adminId}/team/{teamId}/name` body `TeamNameUpdateTO { teamName }` → `TeamTO`.
- [ ] Self-service: `PUT /rest/self/v1/{selfAdminId}/{participantId}/{teamId}/teamname` (same body) in `SelfAdminServiceRest` → `SelfAdminService.updateTeamName` (context check + D2 check, then `TeamService.updateTeamName`). `GET .../team` already returns `TeamTO` (now with name). Add allowed-flag to what the page needs (extend `TeamTO` for self endpoint or return a small `SelfAdminTeamNameInfoTO`).
- [ ] Security: membership check, team of the same dinner (IDOR), cancelled participants/teams rejected, D2 block returns a dedicated `IssueKeys` error (e.g. `TEAM_NAME_CHANGE_NOT_ALLOWED_ROUTES_SENT`).

### 5.3 Backend – events / activities (D3)
- [ ] `TeamNameChangedEvent` (+ `EventPublisher.notifyTeamNameChanged…`), publish after commit (pattern of `TeamsHostChangedEvent`).
- [ ] `ActivityType.TEAMNAME_CHANGED` + `ActivityService` template + listener (REQUIRES_NEW) – message e.g. "Team 3: Teamname von 'A' auf 'B' geändert (durch Admin / Teilnehmer X)". Escape names (activity messages contain HTML). Check the activity list UI / `ActivityService` type-mapping (lines ~49, ~455, ~509) and the frontend activity type display + i18n.
- [ ] Optionally add the name to existing admin-facing activity messages (`Team 3 (Die Gourmets)`).

### 5.4 Backend – mails & links (D1, D4)
- [x] (replaced by meal suffix, see 5a) `FormatterUtil`: constants `TEAMNAME = "\\{teamname\\}"`, `MANAGE_TEAMNAME_LINK = "\\{managenamelink\\}"`; helper returns HTML-escaped name or `""`; always replace with `Matcher.quoteReplacement`.
- [ ] `DinnerRouteMessageFormatter`: `{teamname}` in main message and `selfTemplate` (own team), `hostsTemplate` (visited team; not in the cancelled branch).
- [ ] `TeamArrangementMessageFormatter` (TEAM mail): `{teamname}` and `{managenamelink}` (anchor HTML like `managehostlink`).
- [ ] `UrlGenerator.constructManageTeamNameUrl(selfAdminId, teamId, participantId)` + property `dinner.team.managename.url=${dinner.self.url}/teamname/{participantId}/{teamId}` in `application.properties` (+ test/other profile properties if the host URL is repeated there).
- [ ] Decide whether a team-name-changed mail to the partner is wanted (not in scope; skip).

### 5.5 Mail templates (frontend `shared`/`webapp`)
- [ ] `MessagesContainer.tsx`: placeholder buttons `{teamname}` (TEAM mail, DINNERROUTE main, self/hosts templates) and `{managenamelink}` (TEAM mail); help texts in `AdminMessages_lang_*.json` (like `message_template_help_managehostlink`).
- [ ] Default TEAM mail text (`mails_template_sendteams_message`): add a sentence with `{managenamelink}` for **new** dinners (optional naming + note that it is possible until route mails are sent). Dinner-route defaults unchanged (D1).

### 5.6 Frontend `shared`
- [ ] Types: `BaseTeam.teamName?`, dinner-route team `teamName?`, portal `TeamSelfServiceInfo` (`teamName`, `manageTeamNameUrl`, `teamNameChangeAllowed`).
- [x] ~~Client validation helper~~ dropped: validation only in backend (see design point 2); client only has `hasCustomTeamName`/`getCustomTeamName` for display.
- [ ] `getTeamLabel` helper (+ `Team.spec.ts` tests); update `TeamNr.jsx` / `TeamNameHook.js`.
- [ ] Services/hooks: `updateTeamNameAsync` (admin, `TeamService.ts`), `updateSelfTeamName` (`SelfAdminService.ts`), mutation hooks invalidating team list, meeting plan, dinner route and self-service-info queries.
- [ ] i18n de/en: labels, help text (allowed characters, 48 chars), success message, error messages (invalid chars, routes already sent), self-admin page texts (`SelfAdminMessages_lang_*.ts`).

### 5.7 Frontend `webapp` – admin (D6)
- [ ] `TeamRow.jsx`: unchanged columns (number only); name as `Tooltip` on the number cell (and possibly caption under the number on wide screens – check visually, no new column).
- [ ] `TeamDetails.tsx`: header `Team 3 – "Die Gourmets"` + context-menu entry "Edit team name" → `EditTeamNameDialog.tsx` (react-hook-form + Yup; pattern `ChangeTeamHostDialog.jsx`).
- [ ] `TeamSchedule.jsx`, `SwapMealsDialog.tsx`, `TeamCancelDialog.tsx`, `WaitingListManagementDialog.tsx`, `ChangeTeamHostDialog.jsx`, hostlocations pages: use `getTeamLabel` (name + number).
- [ ] Map markers (`DinnerRouteMapView`) keep numbers; marker title may show name.
- [ ] Re-creation confirm dialog hint: custom names are lost.

### 5.8 Frontend `webapp` – participant (D4)
- [ ] `self/SelfAdminRoute.tsx`: route `:selfAdminId/teamname/:participantId/:teamId` → new `SelfAdminChangeTeamNamePage.tsx` (pattern of `SelfAdminChangeTeamHostPage.tsx`): shows current name, form, save; if change not allowed → info message; success → confirmation.
- [ ] `portal/selfservice/MyTeamSection.tsx`: row "Team name" (value or hint "not set") + button "Set/Change team name" linking to `manageTeamNameUrl`; hidden/disabled with tooltip when `!teamNameChangeAllowed`. Update `MyTeamSection.spec.jsx`.
- [ ] `common/dinnerroute/DinnerRouteComponents.tsx` (shared by admin + self): name-aware labels via `getTeamLabel`; same `NAME_OR_NUMBER` format (max. 14 name characters) for admin and participants.
- [ ] `portal/selfservice/DinnerRouteSection.tsx`, `self/SelfAdminDinnerRoutePage.tsx`: show visited team names.

### 5.9 Tests
Backend:
- [ ] Validator table tests (umlauts, `ß`, accents, Cyrillic/Greek/etc. letters, digits, `! ? _ - . ' / &`, 48 vs 49 chars, emoji, `<script>`, `"`/`<`/`>`/`\`/`$`, leading punctuation, only spaces, leading/trailing/multiple spaces, NFD vs NFC).
- [ ] `TeamServiceTest`: update name (trim/clear), invalid rejected, `swapMeals` swaps names (extend `swapMeals` test at ~line 450), `WaitingListServiceTest` keeps names.
- [ ] Self-service: member can update; non-member / other dinner / cancelled → rejected; **blocked after `DINNERROUTE_MAIL_SENT`**; admin path not blocked (D2 assumption).
- [ ] Activity entry created for admin + participant change.
- [ ] Formatter tests: `{teamname}` self/hosts/main/TEAM mail, empty when absent, escaped, `$`/`\` safe; `{managenamelink}` generated.
- [ ] `ParticipantPortalService`: `manageTeamNameUrl`, `teamNameChangeAllowed` before/after route mails.
- [ ] `DinnerRouteTeamTOTest` mapping.

Frontend (Vitest): `getTeamLabel`, validation helper (same example table), `EditTeamNameDialog`, `SelfAdminChangeTeamNamePage` (allowed/blocked), `MyTeamSection` with/without name and blocked state.

E2E (Cypress): admin sets name → visible in team details; participant opens link from portal and renames → admin sees new name + activity entry; after route mails sent participant edit is blocked.

### 5.10 Docs / release
- [ ] News entry (`webapp/src/landing/news/NewsMessages_lang_de.ts` + `_en.ts`).
- [ ] Update `discovery/participant-portal-concept.md` / `specs/001-participant-portal` if the portal feature list is maintained there.

## 5a. Implementation status

**Done (steps 1–3 + admin part of step 2):**
- Backend: migration `V2.13`, `Team.teamName`, `TeamNameUtil` (+ `TeamNameUtilTest`), `TeamTO`/`DinnerRouteTeamTO.teamName`, meal swap swaps names, waiting-list restore keeps names, `TeamService.updateTeamName(adminId, teamId, name[, executingParticipant])` emitting `TeamNameChangedEvent` → activity (`CUSTOM_ADMIN_CHANGE` for admin, new `PARTICIPANT_CHANGED_TEAMNAME` for participants), admin endpoint `PUT .../team/{teamId}/name`. Full backend suite green (355 tests).
- Frontend `shared`: `TeamName.ts` (validation/normalization, `getCustomTeamName`, `hasCustomTeamName`), central `TeamLabel.tsx` (`TeamLabel` component, `useTeamLabel`, `TeamLabelFormat`: `NUMBER_AND_NAME` | `NAME_OR_NUMBER` | `NUMBER_ONLY`; optional `maxNameLength` shortens only the name) which **replaces** `TeamNr` and `useTeamName`, `updateTeamNameAsync`, `invalidateTeamDependentQueries`, i18n keys (`team_name*`, `team_with_name`).
- Frontend `webapp`: all hard-coded team labels (dinner route components/view/map, hostlocations, schedule, dialogs, waiting list) now use `TeamLabel`/`useTeamLabel`; `DinnerRouteView`/`DinnerRouteMapView` always show `NAME_OR_NUMBER` with `DINNER_ROUTE_TEAM_NAME_MAX_LENGTH = 14`; the host-locations cockpit shortens names to 20 characters in its filter list; reusable `common/team/TeamNameForm.tsx` (`useTeamNameForm` + `TeamNameForm`) and admin `EditTeamNameDialog` (context menu in `TeamDetails`); team list shows the name as small caption in the members cell (number column unchanged).

**Done (step 4, self-service):**
- Backend: property `dinner.team.managename.url` + `UrlGenerator.constructManageTeamNameUrl`, placeholder `{managenamelink}` in `TeamArrangementMessageFormatter` (TEAM mail), `SelfAdminService.updateTeamName`/`findTeamNameInfo` (membership check via `buildSelfAdminContext`; blocked with `IssueKeys.TEAM_NAME_CHANGE_NOT_ALLOWED_ROUTES_SENT` once `ActivityService.isDinnerRouteMailsSent`; admins unrestricted), `GET`/`PUT /rest/self/v1/{selfAdminId}/{participantId}/{teamId}/teamname`, `TeamSelfServiceInfo.teamName/manageTeamNameUrl/teamNameChangeAllowed`. Full backend suite green (360 tests).
- Frontend: route `:selfAdminId/teamname/:participantId/:teamId` → `SelfAdminChangeTeamNamePage` (reuses `TeamNameForm`), portal `MyTeamSection` shows the team name and a "set/change team name" button (hidden when final), `{managenamelink}` placeholder button + help text + default TEAM mail sentence.

**Decided against a `{teamname}` placeholder** (removing the whole line if there is no name breaks templates that put it next to other information). Instead: in dinner route mails the custom team name is appended **hard-coded in parentheses to the meal of each visited team** (`FormatterUtil.generateMealLabelWithTeamName`, e.g. `Hauptgang (Die Gourmets)`, HTML-escaped); teams without a name are unchanged. The own team's meal block (`selfTemplate`) is not changed.

**Open (next):**
- Step 6: e2e, news entry, re-creation hint, docs.

## 6. Suggested implementation order (small, shippable steps)

1. **Backend core**: migration, entity, validator, TOs (`teamName` exposed read-only), swap-meals + restore handling, tests.
2. **Admin edit**: admin endpoint + activity/event (D3) + `shared` service/hooks/helper + admin UI (details, dialog, schedule, dialogs) + tests.
3. **Display in dinner routes** (admin + participant) via `getTeamLabel` refactoring.
4. **Self-service change**: URL generator + property, self endpoint with D2 block, `SelfAdminChangeTeamNamePage`, portal `MyTeamSection` button, `TeamSelfServiceInfo` fields + tests.
5. **Mails**: `{teamname}`, `{managenamelink}`, template buttons/help texts, default TEAM mail text.
6. **Polish**: e2e, news entry, docs.

## 7. Risks & edge cases

- **Injection / escaping**: `&` and `'` are allowed, so escape server-side in mails and activity messages (e.g. `Tom & Jerry` → `Tom &amp; Jerry`, no double escaping in the activity list/frontend rendering – verify how `ActivityService` messages are rendered); use `Matcher.quoteReplacement`. Add a formatter test with `&` and `'`.
- **Validation only in backend**: invalid names are rejected with a field issue (`teamName` / `team_name_invalid`); the input shows the translated message after submit (no live validation while typing).
- **Unicode normalization**: NFC normalize before length/regex check so combined characters count correctly; reject control characters/zero-width chars (covered by whitelist).
- **Swap members** (ignored for now): name stays with the `Team` entity; known limitation.
- **Cancelled / replaced members** (`cancelTeamMember`, waiting-list replacement): name stays with team.
- **Full team re-creation** drops names.
- **Concurrent edits** (both members/admin): last write wins; pages refetch after save.
- **Moderation**: restricted charset limits abuse but not offensive words; admin can override/clear any time (D2 assumption).
- **Existing custom mail templates** won't contain the placeholders → feature invisible in mails until admins add them; only new dinners get the link in the default TEAM mail. TEAM mail already sent for existing dinners → participants can still find the link in the portal.
- **Timing**: team mail may be sent weeks before route mails; name changes after route mails are impossible by participants – communicate this in the page and in the default mail text.
- **Link already in sent TEAM mails** of in-flight dinners is not available (placeholder is new) – portal button covers this.
- Map marker labels (numeric order index) remain numbers.

## 8. Open points

None – all questions resolved:

- Admin may still edit after route mails were sent (D2).
- Character set: letters (any language), digits, space, `! ? _ - . ' / &` (D5).
- Default TEAM mail text gets the `{managenamelink}` sentence for new dinners only (5.5).
- Entry points for participants are the self-service link (TEAM mail) and the portal button linking to the same page; no inline edit in the portal (D4).
