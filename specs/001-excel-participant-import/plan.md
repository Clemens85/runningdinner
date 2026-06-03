# Implementation Plan: Excel Participant Import

**Branch**: `001-excel-participant-import` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-excel-participant-import/spec.md`

## Summary

Allow event organizers to import participants in bulk from an `.xlsx` file. Excel parsing happens entirely in the browser using **SheetJS** (lazy-loaded via dynamic import). After parsing, a comprehensive preview validates every row (duplicate detection, mandatory field checks) before the organizer confirms. Each valid row is then submitted individually to the existing create-participant backend endpoint. A downloadable template with an instructions sheet helps organizers prepare the correct file format. The UX entry point is a new "Excel" dropdown button in the participant list header that replaces the current plain export button and exposes both export and import as menu items.

## Technical Context

**Language/Version**: TypeScript 5 (frontend); Java 21 / Spring Boot 3.4+ (backend — unchanged for this feature)  
**Primary Dependencies**: React 18, Vite, Material-UI v5, `@tanstack/react-query`, `react-i18next`, `xlsx` (SheetJS Community Edition — new dependency in `shared`)  
**Storage**: N/A — no new schema changes; existing PostgreSQL via JPA unchanged  
**Testing**: Vitest + React Testing Library (frontend unit tests); no new backend tests needed (no backend changes)  
**Target Platform**: Modern browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application — admin frontend feature  
**Performance Goals**: Full preview of 200-row Excel file in < 5 seconds (including lazy-loading `xlsx` on first use ~1–2 s, then ~3 s parse + validate)  
**Constraints**: `xlsx` library MUST NOT be in the main bundle; lazy-loaded via `await import('xlsx')` only when the import dialog opens. Vite handles code-splitting automatically.  
**Scale/Scope**: Frontend-only change. One new `shared` service module, one new `webapp` dialog component, one header modification. No backend changes.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                               | Status  | Notes                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Service Boundaries (controller → service → repository) | ✅ PASS | No backend changes. The existing `ParticipantServiceRest` → `ParticipantService` → repository chain is reused without modification.                                                                                                    |
| II. Shared-First Frontend Logic                                         | ✅ PASS | All parsing, validation, and mapping logic lives in `shared/src/admin/participants/import/`. UI components (dialog, preview table) live in `webapp`. API calls use `BackendConfig.buildUrl()` via the existing `saveParticipantAsync`. |
| III. Stable Contracts and IDs                                           | ✅ PASS | `adminId` is passed as a required prop and never logged. No new endpoints — existing API contracts unchanged.                                                                                                                          |
| IV. Data and Schema Discipline                                          | ✅ PASS | No schema changes, no Flyway migrations. The existing `BaseParticipantTO` DTO (which is already separate from the JPA entity) handles the request body.                                                                                |
| V. Event-Driven Side Effects                                            | ✅ PASS | Side effects (geocoding, email dispatch) are already triggered by the existing participant save logic on the backend. No changes needed.                                                                                               |
| VI. Error Handling & Logging                                            | ✅ PASS | Backend errors from individual participant saves are caught with `useBackendIssueHandler` (existing pattern). The import loop collects failures and reports them in a post-import summary without silently dropping them.              |

## Project Structure

### Documentation (this feature)

```text
specs/001-excel-participant-import/
├── plan.md              # This file
├── research.md          # Phase 0 — library choice, UX pattern, column mapping
├── data-model.md        # Phase 1 — ExcelImportRow, ImportPreview, column layout
├── quickstart.md        # Phase 1 — setup, file layout, key code snippets
├── contracts/
│   └── api-contracts.md # Phase 1 — service function signatures, i18n keys, Excel format
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (new files)

```text
runningdinner-client/
├── shared/src/admin/participants/import/
│   ├── types.ts                        # ExcelImportRow, ImportPreview, ExcelImportRowData
│   ├── ExcelParserService.ts           # parseExcelFile(), generateImportTemplate()
│   ├── ImportValidationService.ts      # validateImportRows()
│   ├── ImportMappingService.ts         # buildParticipantFromImportRow()
│   └── index.ts                        # barrel exports
│
└── webapp/src/admin/participants/
    └── import/
        ├── ExcelImportDialog.tsx        # Full import flow dialog (file pick → preview → confirm)
        ├── ImportPreviewTable.tsx       # Row-by-row preview with status badges
        ├── ImportSkipConfirmDialog.tsx  # Modal for skipped-row acknowledgement
        └── useParticipantImport.ts     # State machine hook: idle → parsing → previewing → importing → done
```

### Source Code (modified files)

```text
runningdinner-client/
├── shared/src/index.ts                                    # Export new import types & services
├── webapp/src/admin/participants/list/
│   └── ParticipantsListHeader.tsx                        # Export button → Excel dropdown
├── webapp/src/admin/participants/ParticipantsPage.tsx    # Wire import dialog trigger + refetch
└── shared/src/i18n/translations/                         # Add new i18n keys (de + en)
```

**Structure Decision**: Web application (frontend-only). No backend directory changes.

## Complexity Tracking

No constitution violations. No complexity justification required.
