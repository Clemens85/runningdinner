# Data Model: Excel Participant Import

**Feature Branch**: `001-excel-participant-import`  
**Phase**: 1 — Design  
**Created**: 2026-06-02

---

## Overview

All data model types for this feature are **client-side only** (TypeScript in `shared`). No new backend entities or database schema changes are required. The feature reuses the existing `Participant` / `ParticipantFormModel` types for the final API payload and introduces new transient types for the import lifecycle.

---

## New Frontend Types

### `ExcelImportRowStatus`

```typescript
// shared/src/admin/participants/import/types.ts

export type ExcelImportRowStatus = "VALID" | "WARNING" | "ERROR";
```

### `ExcelImportValidationMessage`

```typescript
export interface ExcelImportValidationMessage {
  /** Which field this message belongs to, or null for row-level messages */
  field: keyof ExcelImportRowData | null;
  /** Human-readable message (already translated, populated during validation) */
  message: string;
}
```

### `ExcelImportRowData`

The raw fields parsed from a single Excel row. Deliberately flat — all strings from the spreadsheet before type coercion.

```typescript
export interface ExcelImportRowData {
  // Mandatory
  firstnamePart: string;
  lastname: string;
  email: string;
  street: string;
  streetNr: string;
  zip: string;
  cityName: string;
  // Optional
  gender: string; // "m" / "w" / "divers" / ""
  age: string; // numeric string or ""
  numSeats: string; // numeric string or ""
  mobileNumber: string;
  addressRemarks: string;
  notes: string;
  vegetarian: string; // "ja" / "yes" / "1" / ""
  vegan: string;
  lactose: string;
  gluten: string;
  mealSpecificsNote: string;
  // Team partner wish — email mode (takes precedence)
  teamPartnerWishEmail: string;
  // Team partner wish — name mode (used only when teamPartnerWishEmail is empty)
  teamPartnerWishPartnerFirstname: string;
  teamPartnerWishPartnerLastname: string;
}
```

### `ExcelImportRow`

A parsed + validated row ready for preview display.

```typescript
export interface ExcelImportRow {
  /** 1-based row number in the Excel file (for user display) */
  rowNumber: number;
  /** Raw parsed data */
  data: ExcelImportRowData;
  /** Aggregated status — worst of all messages */
  status: ExcelImportRowStatus;
  /** All validation messages for this row */
  validationMessages: ExcelImportValidationMessage[];
}
```

### `ImportPreview`

The aggregate shown to the organizer before confirmation.

```typescript
export interface ImportPreview {
  rows: ExcelImportRow[];
  /** Counts derived from rows */
  counts: {
    total: number;
    valid: number;
    warnings: number;
    errors: number;
  };
}
```

---

## Excel Column Layout (Import Template)

The import Excel file uses a **fixed column order**. The first row is the header row. All columns must be present (may be empty for optional fields).

| Col | Header (German)       | Field                             | Mandatory | Notes                                        |
| --- | --------------------- | --------------------------------- | --------- | -------------------------------------------- |
| A   | Vorname               | `firstnamePart`                   | ✅        |                                              |
| B   | Nachname              | `lastname`                        | ✅        |                                              |
| C   | E-Mail-Adresse        | `email`                           | ✅        | Must be unique                               |
| D   | Geschlecht            | `gender`                          | ✅        | `m`, `w`, `divers` (case-insensitive)        |
| E   | Alter                 | `age`                             |           | Positive integer or empty                    |
| F   | Straße                | `street`                          | ✅        |                                              |
| G   | Hausnummer            | `streetNr`                        | ✅        |                                              |
| H   | PLZ                   | `zip`                             | ✅        |                                              |
| I   | Stadt                 | `cityName`                        | ✅        |                                              |
| J   | Adresszusatz          | `addressRemarks`                  |           |                                              |
| K   | Anzahl Sitzplätze     | `numSeats`                        |           | Non-negative integer or empty                |
| L   | Handy-Nr              | `mobileNumber`                    |           |                                              |
| M   | Vegetarisch           | `vegetarian`                      |           | `ja`/`yes`/`1` = true; anything else = false |
| N   | Vegan                 | `vegan`                           |           | Same                                         |
| O   | Laktosefrei           | `lactose`                         |           | Same                                         |
| P   | Glutenfrei            | `gluten`                          |           | Same                                         |
| Q   | Essenswünsche (Notiz) | `mealSpecificsNote`               |           | Free text                                    |
| R   | Sonstige Anmerkungen  | `notes`                           |           | Free text                                    |
| S   | Teamwunsch E-Mail     | `teamPartnerWishEmail`            |           | If filled, cols T+U are ignored              |
| T   | Teamwunsch Vorname    | `teamPartnerWishPartnerFirstname` |           | Used only when col S is empty                |
| U   | Teamwunsch Nachname   | `teamPartnerWishPartnerLastname`  |           | Used only when col S is empty                |

---

## Validation Rules

Applied client-side during preview generation (in `shared/src/admin/participants/import/`):

| Rule                       | Status if triggered | Condition                                                                                    |
| -------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| Missing mandatory field    | ERROR               | `firstnamePart`, `lastname`, `email`, `street`, `streetNr`, `zip`, or `cityName` is blank    |
| Invalid email format       | ERROR               | `email` does not match basic email pattern                                                   |
| Intra-file duplicate email | ERROR               | Same email appears in ≥ 2 rows of the uploaded file                                          |
| Duplicate against existing | ERROR               | `email` matches an existing registered participant                                           |
| Invalid gender value       | WARNING             | `gender` is non-empty and not one of the accepted values                                     |
| Partner email not found    | WARNING             | `teamPartnerWishEmail` is filled but not found in the uploaded file or existing participants |
| Partner self-reference     | ERROR               | `teamPartnerWishEmail` equals the participant's own `email`                                  |
| Invalid numSeats           | WARNING             | `numSeats` is non-empty but not a non-negative integer                                       |
| Invalid age                | WARNING             | `age` is non-empty but not a positive integer                                                |

---

## Mapping: `ExcelImportRowData` → `ParticipantFormModel`

When a valid row is submitted to the backend, it is mapped to the existing `ParticipantFormModel`:

```
firstnamePart          → Participant.firstnamePart
lastname               → Participant.lastname
email                  → Participant.email
street                 → Participant.street
streetNr               → Participant.streetNr
zip                    → Participant.zip
cityName               → Participant.cityName
addressRemarks         → Participant.addressRemarks
gender (parsed)        → Participant.gender   (CONSTANTS.GENDER.MALE / FEMALE / UNDEFINED)
age (parsed int)       → Participant.age
numSeats (parsed int)  → Participant.numSeats  (-1 if empty)
mobileNumber           → Participant.mobileNumber
vegetarian (bool)      → Participant.vegetarian
vegan (bool)           → Participant.vegan
lactose (bool)         → Participant.lactose
gluten (bool)          → Participant.gluten
mealSpecificsNote      → Participant.mealSpecificsNote
notes                  → Participant.notes

-- Team partner wish (mutually exclusive) --
teamPartnerWishEmail (non-empty)
  → Participant.teamPartnerWishEmail

teamPartnerWishPartnerFirstname + teamPartnerWishPartnerLastname (non-empty, no email)
  → Participant.teamPartnerWishRegistrationData = { firstnamePart, lastname }
```

---

## State Transitions

```
[No file selected]
    |
    | user selects file
    v
[Parsing in progress]  (xlsx lazy-loaded + FileReader)
    |
    | parsing complete
    v
[Preview visible]  — ImportPreview displayed, no data saved yet
    |
    | user clicks "Confirm import"
    |-- if error rows exist --> [Skip-errors confirmation modal]
    |                               |
    |                               | user confirms skip
    |                               v
    v
[Importing]  — sequential API calls for valid rows
    |
    | all calls complete
    v
[Import complete]  — refetch() called, participant list refreshed
    |
    | dialog closes
    v
[Initial state]
```

---

## No Backend Changes

The import feature requires **no new backend endpoints, no Flyway migrations, and no new JPA entities**. The existing:

- `POST /rest/participantservice/v1/runningdinner/{adminId}/participant` (create participant)
- `BaseParticipantTO` with `teamPartnerWishEmail` and `teamPartnerWishRegistrationData` fields

are sufficient. Backend field validation (`@NotBlank`, `@Email`, `@Valid`) will catch any malformed data that slips past the client-side checks.
