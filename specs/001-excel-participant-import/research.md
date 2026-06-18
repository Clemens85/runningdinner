# Research: Excel Participant Import

**Feature Branch**: `001-excel-participant-import`  
**Phase**: 0 — Resolve unknowns  
**Created**: 2026-06-02

---

## Decision 1: Client-Side Excel Parsing Library

**Decision**: Use **SheetJS Community Edition** (`xlsx` npm package).

**Rationale**:

- De-facto standard for browser-side Excel read/write (36K+ GitHub stars).
- Apache 2.0 license — no commercial restrictions, attribution only.
- Smallest footprint among full-featured solutions (~380 KB uncompressed, ~120 KB gzipped).
- Covers both directions: reading `.xlsx` for import and generating `.xlsx` for the template download.
- Single package = one dynamic import to lazy-load both capabilities.

**Alternatives considered**:

- **ExcelJS** (MIT): More feature-rich (rich cell styling, images), but heavier. Not needed for our read-simple-columns use case.
- **XLSX-populate** (MIT): Browser-focused, jQuery-style chaining API. Less community momentum.

**Key API surface**:

```typescript
// --- READING (import) ---
const arrayBuffer = await file.arrayBuffer();
const workbook = XLSX.read(arrayBuffer, { type: 'array' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // raw 2D array

// --- WRITING (template download) ---
const wb = XLSX.utils.book_new();
const dataSheet = XLSX.utils.aoa_to_sheet([['Col1', 'Col2', ...]]);
const instrSheet = XLSX.utils.aoa_to_sheet([['Instructions heading'], ['Row...']]);
XLSX.utils.book_append_sheet(wb, dataSheet, 'Vorlage');
XLSX.utils.book_append_sheet(wb, instrSheet, 'Hinweise');
XLSX.writeFile(wb, 'teilnehmer-vorlage.xlsx');
```

**Lazy-load pattern for Vite/React** (no separate Vite config required — Vite code-splits dynamic imports automatically):

```typescript
// In the service function / hook, called only when user opens import flow:
const XLSX = await import("xlsx");
```

Vite splits `xlsx` into a separate async chunk. The main bundle is unaffected.

---

## Decision 2: UX Control — Import/Export Entry Point

**Decision**: **MUI Button + Menu (dropdown button)** pattern.

**Rationale**:

- Cleanest approach for mixing an `href`-based action (export = anchor link to backend) and a `onClick`-based action (import = open dialog).
- The codebase already uses this `Button` + `Menu`/`MenuItem` pattern in `ContextMenuIcon.tsx`.
- The official MUI "Split button" recipe (ButtonGroup + Popper) is designed for when both actions are the same type; it adds complexity without benefit here.
- The button label will be "Excel" with a `KeyboardArrowDownIcon`, communicating the dropdown nature. The two menu items are labelled "Exportieren" and "Importieren".

**Component skeleton** (to be placed in `ParticipantsListHeader.tsx`):

```typescript
<Button endIcon={<KeyboardArrowDownIcon />} onClick={handleOpen} color="primary">
  Excel
</Button>
<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
  <MenuItem component="a" href={getParticipantsExportUrl(adminId)} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
    {t('admin:export')}
  </MenuItem>
  <MenuItem onClick={handleImportClick}>
    {t('admin:import')}
  </MenuItem>
</Menu>
```

**Alternatives considered**:

- **MUI ButtonGroup Split Button**: Beautiful but awkward for mixed href/handler actions; more code.
- **Separate Import button next to Export button**: Clutters the header; doesn't scale if more actions come later.

---

## Decision 3: Participant List Refresh After Import

**Decision**: Call the existing `refetch()` from `useFindParticipants` after all import API calls complete.

**Rationale**: The `ParticipantsPage` already threads `refetch` down to child components for exactly this purpose (e.g., after delete, after team partner wish changes). This is the established pattern — no `invalidateQueries` plumbing is needed.

---

## Decision 4: Existing Export Excel Column Layout (Mapping)

The current backend export (`AbstractExcelConverterHighLevel.createHeaderRow`) writes these columns:

| Col # | Header (German)      | Participant field                          |
| ----- | -------------------- | ------------------------------------------ |
| 0     | Nr                   | participantNumber                          |
| 1     | Name                 | fullname (firstname + lastname combined)   |
| 2     | E-Mail-Adresse       | email                                      |
| 3     | Geschlecht           | gender                                     |
| 4     | Alter                | age                                        |
| 5     | Adresse              | street + streetNr + city (combined string) |
| 6     | Anzahl Plätze        | numSeats                                   |
| 7     | Handy-Nr             | mobileNumber                               |
| 8     | Sonstige Anmerkungen | notes                                      |
| 9     | Essenswünsche        | mealSpecificsNote                          |

**Missing fields for import** (not in the current export):

- `firstnamePart` and `lastname` as separate columns (the current export merges them into "Name")
- `street`, `streetNr`, `zip`, `cityName` as separate columns (currently merged)
- Dietary boolean flags: `vegetarian`, `vegan`, `lactose`, `gluten` (currently only `mealSpecificsNote`)
- `addressRemarks`
- `teamPartnerWishEmail` (for email-based partner wish)
- `teamPartnerWishPartnerFirstname` + `teamPartnerWishPartnerLastname` (for name-based partner wish)

**Resolution**: The import template uses an **extended column format** with split fields. This is a new column layout distinct from the existing export. The existing export remains unchanged (no regression). Users who want to import an old export must use the new template instead.

> Exporting to the new extended format (that is also importable) can be a future improvement.

---

## Decision 5: Team Partner Wish — Backend Mapping

Two modes, resolved per spec FR-015:

1. **Email mode**: Fill `Participant.teamPartnerWishEmail` field. Backend uses existing `teamPartnerWishEmail` validation and matching logic.
2. **Name-only mode**: Fill `Participant.teamPartnerWishRegistrationData` (`firstnamePart` + `lastname`, no email). The backend already supports this via `TeamPartnerWishRegistrationDataTO`. An unresolved wish intent is stored — no phantom partner participant is created.

When both columns are filled, email takes precedence (name columns ignored).

---

## Decision 6: Import Preview — Client-Side Duplicate Detection

To detect duplicates against existing participants, the import flow must load the current participant list **before** the file is selected. The list is already loaded by `useFindParticipants` (cached by React Query) on the `ParticipantsPage`. The import component receives the participant list as a prop or reads it from the query cache — no extra API call needed.

---

## Decision 7: Import Preview — Partial Import UX Flow

Per FR-012: if error rows are present, the organizer may still proceed but must see a skip summary. The UI flow:

1. Preview screen shows all rows (valid, warning, error).
2. "Confirm import" button is always enabled when at least one valid row exists.
3. If error rows exist, clicking "Confirm import" first shows a **modal confirmation** listing the N rows that will be skipped, with a secondary CTA ("Skip errors and import X valid participants").
4. On confirmation, only valid rows are submitted to the backend.

---

## Resolved Unknowns

| Unknown                          | Resolution                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Which Excel library?             | SheetJS Community Edition (`xlsx`)                                            |
| Lazy-load mechanism?             | `await import('xlsx')` — Vite auto-splits                                     |
| UX control for import/export?    | Button + Menu dropdown, label "Excel"                                         |
| Participant list refresh?        | `refetch()` from `useFindParticipants`                                        |
| Existing export columns?         | Mapped above; import uses extended split-column format                        |
| Team partner wish in import?     | Email → `teamPartnerWishEmail`; Name-only → `teamPartnerWishRegistrationData` |
| Duplicate detection data source? | React Query cached participant list (no extra API call)                       |
| Partial import with errors?      | Confirmation modal showing skipped rows before final submit                   |
