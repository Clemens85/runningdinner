# API Contracts: Excel Participant Import

**Feature Branch**: `001-excel-participant-import`  
**Phase**: 1 — Design  
**Created**: 2026-06-02

---

## Overview

This feature is **entirely additive on the frontend**. No new backend endpoints are introduced. The contracts documented here are:

1. The existing backend endpoint used for submitting each participant.
2. The new frontend service functions introduced in `shared`.
3. The Excel file format contract (column structure).

---

## 1. Backend Endpoint (Existing — Reused)

### Create Participant

```
POST /rest/participantservice/v1/runningdinner/{adminId}/participant
```

**Already documented** in the existing codebase. Reused without modification.

**Request body** (`BaseParticipantTO`):

```json
{
  "firstnamePart": "Maria",
  "lastname": "Muster",
  "email": "maria@muster.de",
  "gender": "FEMALE",
  "age": 32,
  "street": "Hauptstraße",
  "streetNr": "5",
  "zip": "79100",
  "cityName": "Freiburg",
  "addressRemarks": "",
  "numSeats": 4,
  "mobileNumber": "",
  "vegetarian": false,
  "vegan": false,
  "lactose": false,
  "gluten": false,
  "mealSpecificsNote": "",
  "notes": "",
  "teamPartnerWishEmail": "partner@muster.de",
  "teamPartnerWishRegistrationData": null
}
```

Alternative with name-only partner wish:

```json
{
  ...
  "teamPartnerWishEmail": "",
  "teamPartnerWishRegistrationData": {
    "firstnamePart": "Klaus",
    "lastname": "Muster"
  }
}
```

**Success**: `201 Created` — returns saved `ParticipantTO`  
**Error**: `400 Bad Request` — returns structured validation errors (handled by existing `useBackendIssueHandler`)

---

## 2. New Frontend Service Functions (`shared`)

All new service logic lives in `runningdinner-client/shared/src/admin/participants/import/`.

### `parseExcelFile(file: File): Promise<ExcelImportRowData[]>`

Lazy-loads `xlsx`, reads the file, maps the fixed column layout to `ExcelImportRowData[]`.  
Returns raw string rows — no validation applied yet.

### `validateImportRows(rows: ExcelImportRowData[], existingParticipants: Participant[]): ExcelImportRow[]`

Pure function. Applies all validation rules (see data-model.md) and returns `ExcelImportRow[]` with status + messages.

### `buildParticipantFromImportRow(row: ExcelImportRowData): ParticipantFormModel`

Maps a valid `ExcelImportRowData` to `ParticipantFormModel` ready for `saveParticipantAsync`.

### `generateImportTemplate(): void`

Lazy-loads `xlsx`, generates a two-sheet workbook (template data sheet + instructions sheet), triggers browser download as `teilnehmer-vorlage.xlsx`.

### `importParticipantsSequentially(adminId: string, rows: ExcelImportRow[]): Promise<ImportResult>`

Calls `saveParticipantAsync` sequentially for each `VALID` (and `WARNING`) row.  
Returns an `ImportResult` with counts of succeeded/failed rows and any backend errors.

---

## 3. Excel File Format Contract

### File

- Format: `.xlsx` (Office Open XML)
- Sheet: First sheet is read; sheet name is ignored
- Row 0: Header row (must match expected headers — validated by column index, not name, for robustness)
- Rows 1+: Data rows

### Column Order (fixed, 0-indexed)

| Index | Header                | Mandatory | Type                                             |
| ----- | --------------------- | --------- | ------------------------------------------------ |
| 0     | Vorname               | ✅        | string                                           |
| 1     | Nachname              | ✅        | string                                           |
| 2     | E-Mail-Adresse        | ✅        | string (email)                                   |
| 3     | Geschlecht            | ✅        | `m` / `w` / `divers`                             |
| 4     | Alter                 |           | integer ≥ 1                                      |
| 5     | Straße                | ✅        | string                                           |
| 6     | Hausnummer            | ✅        | string                                           |
| 7     | PLZ                   | ✅        | string                                           |
| 8     | Stadt                 | ✅        | string                                           |
| 9     | Adresszusatz          |           | string                                           |
| 10    | Anzahl Sitzplätze     |           | integer ≥ 0                                      |
| 11    | Handy-Nr              |           | string                                           |
| 12    | Vegetarisch           |           | `ja` / `yes` / `1`                               |
| 13    | Vegan                 |           | `ja` / `yes` / `1`                               |
| 14    | Laktosefrei           |           | `ja` / `yes` / `1`                               |
| 15    | Glutenfrei            |           | `ja` / `yes` / `1`                               |
| 16    | Essenswünsche (Notiz) |           | string                                           |
| 17    | Sonstige Anmerkungen  |           | string                                           |
| 18    | Teamwunsch E-Mail     |           | string (email); takes precedence over cols 19–20 |
| 19    | Teamwunsch Vorname    |           | string; used only when col 18 is empty           |
| 20    | Teamwunsch Nachname   |           | string; used only when col 18 is empty           |

### Template Sheets

| Sheet name | Purpose                                                                                 |
| ---------- | --------------------------------------------------------------------------------------- |
| `Vorlage`  | Data entry sheet — header row only, no example rows                                     |
| `Hinweise` | Instructions — one row per column explaining purpose, mandatory status, accepted values |

---

## 4. New i18n Keys

New translation keys to add in `shared/src/i18n/translations/`:

```
admin:excel_data_actions           — "Excel" (dropdown button label)
admin:export                       — already exists
admin:import                       — new: "Importieren"
admin:import_participants_title    — "Teilnehmer importieren"
admin:import_download_template     — "Vorlage herunterladen"
admin:import_select_file           — "Excel-Datei auswählen"
admin:import_preview_valid         — "Gültig"
admin:import_preview_warning       — "Warnung"
admin:import_preview_error         — "Fehler"
admin:import_preview_confirm       — "Import bestätigen"
admin:import_preview_confirm_with_skipped — "Fehlerhafte Zeilen überspringen und {{count}} Teilnehmer importieren"
admin:import_skipped_rows_summary  — "{{count}} Zeile(n) werden übersprungen:"
admin:import_success               — "{{count}} Teilnehmer wurden erfolgreich importiert."
admin:import_partial_success       — "{{success}} Teilnehmer importiert, {{failed}} fehlgeschlagen."
admin:import_error_duplicate_existing — "E-Mail bereits registriert"
admin:import_error_duplicate_infile   — "Doppelte E-Mail in der Datei"
admin:import_error_missing_field      — "Pflichtfeld fehlt: {{field}}"
admin:import_warning_partner_not_found — "Teamwunsch-E-Mail nicht gefunden"
admin:import_warning_invalid_gender   — "Ungültiger Geschlechtswert"
```

English equivalents needed in `*_en.ts` files.
