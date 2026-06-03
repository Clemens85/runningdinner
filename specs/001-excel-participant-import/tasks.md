# Tasks: Excel Participant Import

**Input**: Design documents from `/specs/001-excel-participant-import/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api-contracts.md ✅ quickstart.md ✅  
**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: User story label (US1–US5)
- All paths relative to `runningdinner-client/`

---

## Phase 1: Setup

**Purpose**: Install the xlsx library and create new directory structure. No user story work can begin until T001 is done.

- [X] T001 Add `xlsx` npm dependency to `shared/package.json` via `pnpm add xlsx` in `runningdinner-client/shared/`
- [X] T002 [P] Create directory `shared/src/admin/participants/import/` (empty — populated in Phase 2)
- [X] T003 [P] Create directory `webapp/src/admin/participants/import/` (empty — populated in Phase 3)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript types and i18n keys that every subsequent phase depends on. MUST be complete before any user story phase begins.

- [X] T004 Create `shared/src/admin/participants/import/types.ts`
- [X] T005 Create `shared/src/admin/participants/import/index.ts` — barrel export
- [X] T006 [P] Add new import-related i18n keys to `shared/src/i18n/translations/de/AdminMessages_lang_de.json`
- [X] T007 [P] Add new import-related i18n keys to `shared/src/i18n/translations/en/AdminMessages_lang_en.json`

**Checkpoint**: Types compile cleanly. i18n keys present in both locales. Phase 3 can now begin.

---

## Phase 3: User Story 1+2 — Core Import with Validation Preview (Priority: P1) 🎯 MVP

**Goal**: Organizer can select an .xlsx file, see a full per-row validation preview with status badges, acknowledge any skipped error rows, and confirm to batch-save all valid participants via the existing API.

**Independent Test**: Open the participant list dev page, click the temporary import trigger (added in T015), upload `freiburg_30.json`-style data as xlsx — verify preview shows all rows with correct VALID/ERROR statuses, confirm import, and check all valid participants appear in the list.

- [X] T008 [P] [US1] Implement `shared/src/admin/participants/import/ExcelParserService.ts` — `parseExcelFile(file: File): Promise<ExcelImportRowData[]>` with lazy `await import('xlsx')`, reads first sheet, skips header row (row 0), maps columns by fixed index 0–20 to `ExcelImportRowData` fields
- [X] T009 [P] [US1] Implement `shared/src/admin/participants/import/ImportMappingService.ts` — `buildParticipantFromImportRow(row: ExcelImportRowData): ParticipantFormModel` mapping all fields including gender string to `CONSTANTS.GENDER.*`, boolean coercion for dietary flags, numeric parsing for age/numSeats; team partner wish columns handled in Phase 5 (T021)
- [X] T010 [US2] Implement `shared/src/admin/participants/import/ImportValidationService.ts` — `validateImportRows(rows: ExcelImportRowData[], existingParticipants: Participant[]): ExcelImportRow[]` applying all validation rules from data-model.md: mandatory field check, email format, intra-file duplicate detection, duplicate-against-existing detection; derives row `status` from worst message severity
- [X] T011 [P] [US1] Export `parseExcelFile`, `buildParticipantFromImportRow`, `validateImportRows`, `generateImportTemplate` (stub, implemented T017) and all types from `shared/src/index.ts`
- [X] T012 [US1] Implement `webapp/src/admin/participants/import/useParticipantImport.ts` — state machine hook managing flow: `idle → parsing → previewing → confirming-skips → importing → done`; exposes `importPreview`, `importProgress`, `handleFileSelected`, `handleConfirm`, `handleConfirmWithSkips`, `handleReset`; calls `parseExcelFile`, `validateImportRows`, and `saveParticipantAsync` sequentially for each valid row
- [X] T013 [US2] Implement `webapp/src/admin/participants/import/ImportPreviewTable.tsx` — MUI `Table` listing all `ExcelImportRow` entries; each row shows: row number, full name, email, status chip (`VALID`=green / `WARNING`=orange / `ERROR`=red), expandable validation messages; summary header shows total/valid/warning/error counts
- [X] T014 [US1] Implement `webapp/src/admin/participants/import/ImportSkipConfirmDialog.tsx` — MUI `Dialog` shown when preview contains error rows; lists all skipped rows with their errors; two actions: "Zurück" (go back to preview) and "{{count}} Teilnehmer importieren" (proceed with valid rows only)
- [X] T015 [US1] Implement `webapp/src/admin/participants/import/ExcelImportDialog.tsx` — full import flow dialog with three internal views: (1) file picker step with `<input type="file" accept=".xlsx">`, (2) preview step rendering `ImportPreviewTable` + confirm/back buttons, (3) import-in-progress step with `LinearProgress` and per-row counter; shows `ImportSkipConfirmDialog` when error rows exist; displays final success/partial-success snackbar using existing `useCustomSnackbar`
- [X] T016 [US1] Add temporary import trigger to `webapp/src/admin/participants/ParticipantsPage.tsx` — mount `ExcelImportDialog` with `open` state; add a temporary "Import" button near the page header (clearly marked `{/* TODO US5: replace with header dropdown */}`); pass `onImportComplete` callback that calls `refetch()` on the participant list query

**Checkpoint**: US1 + US2 fully functional. Upload a valid .xlsx → preview validates → confirm → participants saved and list refreshes. Error rows blocked with skip-confirm modal.

---

## Phase 4: User Story 3 — Template Download (Priority: P2)

**Goal**: Organizer can download a ready-to-fill `teilnehmer-vorlage.xlsx` with all 21 column headers and a Hinweise (instructions) sheet from within the import dialog.

**Independent Test**: Click "Vorlage herunterladen" in the import dialog step 1 — verify downloaded file has two sheets (`Vorlage` with header row A–U and `Hinweise` with one explanation row per column), and no data rows in the Vorlage sheet.

- [X] T017 [US3] Implement `generateImportTemplate(): void` in `shared/src/admin/participants/import/ExcelParserService.ts` — lazy-loads `xlsx`; builds two-sheet workbook: `Vorlage` sheet with header row only (all 21 column headers from data-model.md), `Hinweise` sheet with column-by-column descriptions (field name, mandatory Y/N, accepted values/format); triggers browser download as `teilnehmer-vorlage.xlsx`
- [X] T018 [US3] Add "Vorlage herunterladen" button to the file-picker step in `webapp/src/admin/participants/import/ExcelImportDialog.tsx` — calls `generateImportTemplate()` on click; styled as a secondary/outlined button alongside the file input

**Checkpoint**: US3 independently testable. Template downloads correctly with both sheets.

---

## Phase 5: User Story 4 — Team Partner Wish Support (Priority: P2)

**Goal**: Organizer can specify team partner wishes in the Excel file — either by partner email (takes precedence) or by partner first+last name (unresolved wish, no linked participant created). Both modes appear correctly in the preview with appropriate warnings.

**Independent Test**: Upload an xlsx with three partner-wish scenarios: (a) valid partner email matching another row in the same file, (b) partner email not found anywhere — should show WARNING, (c) name-only partner wish — preview shows name as unresolved wish with no error. After confirm, verify `teamPartnerWishEmail` and `teamPartnerWishRegistrationData` are set correctly per row.

- [X] T019 [US4] Extend `shared/src/admin/participants/import/ExcelParserService.ts` `parseExcelFile()` — map column index 18 → `teamPartnerWishEmail`, index 19 → `teamPartnerWishPartnerFirstname`, index 20 → `teamPartnerWishPartnerLastname` (already stubbed as empty strings in T008; activate mapping here)
- [X] T020 [US4] Extend `shared/src/admin/participants/import/ImportValidationService.ts` `validateImportRows()` — add partner-specific rules: (1) `ERROR` if `teamPartnerWishEmail` equals the row's own `email` (self-reference); (2) `WARNING` if `teamPartnerWishEmail` is non-empty and not found in the uploaded file's emails nor in `existingParticipants`; (3) when both email and name columns are filled, silently ignore name columns (email takes precedence — no validation message needed)
- [X] T021 [US4] Extend `shared/src/admin/participants/import/ImportMappingService.ts` `buildParticipantFromImportRow()` — if `teamPartnerWishEmail` is non-empty, set `participant.teamPartnerWishEmail`; else if `teamPartnerWishPartnerFirstname` or `teamPartnerWishPartnerLastname` is non-empty, set `participant.teamPartnerWishRegistrationData = { firstnamePart, lastname }` with no email (unresolved wish per FR-015)
- [X] T022 [US4] Extend `webapp/src/admin/participants/import/ImportPreviewTable.tsx` — add a "Teamwunsch" column to the preview table; show partner email (or "Name: Vorname Nachname" for name-only) with a warning chip when the partner was not found
- [X] T023 [US4] Extend `generateImportTemplate()` in `shared/src/admin/participants/import/ExcelParserService.ts` — the Vorlage header row already includes columns S–U (stubbed in T017); extend the Hinweise sheet rows for these three columns explaining email-takes-precedence behavior and name-only unresolved-wish semantics

**Checkpoint**: US4 independently testable. Partner wish columns parsed, validated, mapped, and displayed in preview correctly.

---

## Phase 6: User Story 5 — Excel Dropdown Button in Participant List Header (Priority: P3)

**Goal**: The standalone export button in the participant list header is replaced by a single "Excel" dropdown button that exposes "Exportieren" and "Importieren" as menu items, keeping both actions equally discoverable.

**Independent Test**: Navigate to a participant list with at least one participant — verify the old export button is gone, the new "Excel ▾" button is present, clicking "Exportieren" downloads the xlsx (no regression), clicking "Importieren" opens `ExcelImportDialog`.

- [X] T024 [US5] Add `ExcelActionsButton` component inline in `webapp/src/admin/participants/list/ParticipantsListHeader.tsx` — MUI `Button` with `endIcon={<KeyboardArrowDownIcon />}` labelled `t('admin:excel_data_actions')`; `Menu` with two `MenuItem`s: (1) anchor `href={getParticipantsExportUrl(adminId)}` target `_blank` for export, (2) `onClick={onImportClick}` for import
- [X] T025 [US5] Replace the existing `<Button href={getParticipantsExportUrl(adminId)}>` block in `webapp/src/admin/participants/list/ParticipantsListHeader.tsx` with `<ExcelActionsButton adminId={adminId} onImportClick={onImportClick} />`; add `onImportClick: () => void` to `ParticipantsListHeaderProps`
- [X] T026 [US5] Update `webapp/src/admin/participants/ParticipantsPage.tsx` — pass `onImportClick` prop from page-level import-dialog state down to `ParticipantsListHeader`; remove the temporary trigger button added in T016 (keep `ExcelImportDialog` mount and `refetch` wiring)

**Checkpoint**: US5 fully functional. Export regression-free. Import accessible from header dropdown. Temporary trigger removed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge-case handling, a11y attributes, and bundle validation.

- [X] T027 [P] Add `data-testid` attributes to all interactive elements in `ExcelImportDialog.tsx`, `ImportPreviewTable.tsx`, `ImportSkipConfirmDialog.tsx`, and `ExcelActionsButton` in `ParticipantsListHeader.tsx` for future E2E test coverage
- [X] T028 [P] Add invalid-file-type guard in `webapp/src/admin/participants/import/ExcelImportDialog.tsx` — on file selection, check `file.name` ends with `.xlsx`; if not, show an inline `Alert` error and do not attempt parsing
- [X] T029 Add empty-file guard in `shared/src/admin/participants/import/ExcelParserService.ts` `parseExcelFile()` — if parsed rows array is empty after slicing header, throw a typed `ImportError` with code `NO_DATA_ROWS`; catch in `useParticipantImport.ts` and display user-friendly message in the dialog
- [X] T030 Display post-import backend error summary in `webapp/src/admin/participants/import/ExcelImportDialog.tsx` — after the import loop completes, if `ImportResult.failedRows` is non-empty, render a collapsible error list showing which participant rows failed and the backend error reason (using existing `useBackendIssueHandler` error extraction pattern)
- [X] T031 [P] Run `pnpm build` in `runningdinner-client/` and inspect Vite chunk output — verify `xlsx` appears only in a lazily-loaded async chunk and is absent from the main entry bundle

---

## Dependency Graph

```
T001 (install xlsx)
  └─ T002, T003 (dirs) ──────────────────────────────┐
       └─ T004 (types.ts)                             │
            ├─ T005 (index.ts barrel)                 │
            ├─ T006 (i18n de) ──────────────────────┐ │
            └─ T007 (i18n en) ──────────────────────┤ │
                                                    │ │
Phase 3 (all depend on T004, T005, T006, T007):    │ │
  T008 (parser), T009 (mapper) ─── parallel        │ │
  T010 (validator) ──────────────── after T004      │ │
  T011 (shared/index.ts exports) ── after T008–T010 │ │
  T012 (hook) ──────────────────── after T011       │ │
  T013 (preview table) ─────────── after T004       │ │
  T014 (skip dialog) ───────────── after T004       │ │
  T015 (import dialog) ─────────── after T012–T014  │ │
  T016 (wire to page) ──────────── after T015       │ │
                                                    │ │
Phase 4 (US3, after T008 and T016):                │ │
  T017 (template fn) ─────────────────────────────┘ │
  T018 (template btn in dialog) ── after T015, T017  │
                                                      │
Phase 5 (US4, after T010, T013, T017):                │
  T019 (extend parser cols S–U) ── after T008         │
  T020 (extend validator) ──────── after T010         │
  T021 (extend mapper) ──────────── after T009        │
  T022 (extend preview table) ──── after T013         │
  T023 (extend template Hinweise) ─ after T017        │
                                                      │
Phase 6 (US5, after T015, T016):                      │
  T024 (ExcelActionsButton) ──────── after T006, T007 │
  T025 (replace export btn) ──────── after T024       │
  T026 (wire page, remove tmp) ───── after T025, T016 │
                                                      │
Phase 7 (Polish, after all above): T027–T031       ───┘
```

## Parallel Execution Examples per Story

**US1+US2 (Phase 3)** — can run in parallel immediately after Phase 2:
- Developer A: T008 (parser) + T009 (mapper) + T011 (exports)
- Developer B: T010 (validator) → T012 (hook, needs T011)
- Developer C: T013 (preview table) + T014 (skip dialog) → T015 (dialog, needs T012–T014)
- Merge: T016 (wire to page, needs T015)

**US3 (Phase 4)** — can start T017 in parallel with US4:
- Developer A: T017 (template fn) → T018 (template btn)

**US4 (Phase 5)** — extend existing services in parallel:
- Developer A: T019 (extend parser) + T021 (extend mapper)
- Developer B: T020 (extend validator) → T022 (extend table)
- Developer C: T023 (extend template)

**US5 (Phase 6)** — single sequential chain (T024 → T025 → T026), small scope.

## Implementation Strategy

**MVP scope**: Phases 1–3 (T001–T016) deliver the full core import flow — this is the minimum shippable increment. Users can import all fields except team partner wishes, and the template download is not yet available.

**Increment 2**: Phase 4 (T017–T018) adds the template — recommended to ship together with MVP or immediately after.

**Increment 3**: Phase 5 (T019–T023) adds team partner wish support.

**Increment 4**: Phase 6 (T024–T026) replaces the temporary trigger with the proper UX entry point — required before any public release.

**Increment 5**: Phase 7 (T027–T031) — polish, edge cases, and bundle verification.

## Task Count Summary

| Phase | Stories | Tasks | Notes |
|-------|---------|-------|-------|
| 1 — Setup | — | 3 | T001–T003 |
| 2 — Foundational | — | 4 | T004–T007 |
| 3 — Core Import + Validation | US1, US2 (P1) | 9 | T008–T016 |
| 4 — Template Download | US3 (P2) | 2 | T017–T018 |
| 5 — Team Partner Wish | US4 (P2) | 5 | T019–T023 |
| 6 — Header Dropdown | US5 (P3) | 3 | T024–T026 |
| 7 — Polish | — | 5 | T027–T031 |
| **Total** | | **31** | |
