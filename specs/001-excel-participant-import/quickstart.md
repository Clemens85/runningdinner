# Quickstart: Excel Participant Import

**Feature Branch**: `001-excel-participant-import`  
**Created**: 2026-06-02

---

## What Is Being Built

An Excel import flow embedded in the participant list administration page. Organizers can upload a `.xlsx` file containing participant data, preview and validate all rows client-side before submitting, then batch-create participants using the existing API. A downloadable template with instructions is also provided.

---

## Development Setup

No additional backend setup is needed. The backend is unchanged.

### Frontend

```bash
cd runningdinner-client
pnpm install          # installs xlsx and any other deps added
pnpm -r run dev       # starts shared (watch) + webapp (Vite dev server)
```

### Add `xlsx` dependency

```bash
cd runningdinner-client/shared
pnpm add xlsx
```

---

## File Layout — New Files

```
runningdinner-client/
├── shared/src/admin/participants/import/
│   ├── types.ts                        # ExcelImportRow, ImportPreview, etc.
│   ├── ExcelParserService.ts           # parseExcelFile(), generateImportTemplate()
│   ├── ImportValidationService.ts      # validateImportRows()
│   ├── ImportMappingService.ts         # buildParticipantFromImportRow()
│   └── index.ts                        # barrel exports
│
└── webapp/src/admin/participants/
    ├── import/
    │   ├── ExcelImportDialog.tsx       # Full import flow dialog
    │   ├── ImportPreviewTable.tsx      # Preview table with status badges
    │   ├── ImportSkipConfirmDialog.tsx # Confirmation modal for skipped rows
    │   └── useParticipantImport.ts     # State machine hook for import flow
    └── list/
        └── ParticipantsListHeader.tsx  # MODIFIED: export button → Excel dropdown
```

---

## Files to Modify

| File                                                            | Change                                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `shared/src/admin/participants/import/index.ts`                 | New barrel export                                                       |
| `shared/src/index.ts`                                           | Export new import types and services                                    |
| `webapp/src/admin/participants/list/ParticipantsListHeader.tsx` | Replace export `<Button>` with `ExcelActionsButton` dropdown            |
| `webapp/src/admin/participants/ParticipantsPage.tsx`            | Pass `refetch` into the import dialog trigger; handle import completion |
| `shared/src/i18n/translations/*_de.ts`                          | Add new i18n keys (see contracts/api-contracts.md)                      |
| `shared/src/i18n/translations/*_en.ts`                          | Add English equivalents                                                 |

---

## Key Implementation Notes

### Lazy-Loading `xlsx`

```typescript
// shared/src/admin/participants/import/ExcelParserService.ts
export async function parseExcelFile(
  file: File,
): Promise<ExcelImportRowData[]> {
  const XLSX = await import("xlsx"); // lazy — not in main bundle
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Skip header row (row index 0), return rows from index 1
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  return raw.slice(1).map(mapRowToImportData);
}
```

Vite automatically places `xlsx` in a separate async chunk — no manual Vite config change is needed.

### Duplicate Detection

```typescript
// shared/src/admin/participants/import/ImportValidationService.ts
export function validateImportRows(
  rows: ExcelImportRowData[],
  existingParticipants: Participant[],
): ExcelImportRow[] {
  const existingEmails = new Set(
    existingParticipants.map((p) => p.email.toLowerCase()),
  );
  const seenInFile = new Map<string, number>(); // email → first row number

  return rows.map((row, index) => {
    const messages: ExcelImportValidationMessage[] = [];
    // ... field checks ...
    const emailLower = row.email.toLowerCase();
    if (existingEmails.has(emailLower)) {
      messages.push({
        field: "email",
        message: t("admin:import_error_duplicate_existing"),
      });
    }
    if (seenInFile.has(emailLower)) {
      messages.push({
        field: "email",
        message: t("admin:import_error_duplicate_infile"),
      });
    } else {
      seenInFile.set(emailLower, index + 1);
    }
    // ... derive status from messages ...
    return {
      rowNumber: index + 2,
      data: row,
      status,
      validationMessages: messages,
    };
  });
}
```

### Excel Dropdown Button in `ParticipantsListHeader`

```typescript
// webapp/src/admin/participants/list/ParticipantsListHeader.tsx
// Replace the existing <Button href={getParticipantsExportUrl(...)}> block with:

<ExcelActionsButton adminId={adminId} onImportClick={() => setImportOpen(true)} />
```

`ExcelActionsButton` is a new small component in the same file or in a sibling file.

### Sequential Import with Progress

```typescript
// webapp/src/admin/participants/import/useParticipantImport.ts
for (const row of validRows) {
  try {
    await saveParticipantAsync(
      adminId,
      buildParticipantFromImportRow(row.data),
    );
    succeeded++;
  } catch {
    failed++;
  }
}
refetch(); // refresh participant list after all calls
```

---

## Testing

### Unit tests (Vitest)

- `ImportValidationService.test.ts` — test all validation rules with table-driven cases
- `ImportMappingService.test.ts` — test field mapping including gender normalization

### Manual E2E smoke test

1. Open participant list for a test event.
2. Click the "Excel" dropdown → "Importieren".
3. Download the template, fill in 3 valid rows + 1 row with a missing email + 1 duplicate email.
4. Upload the file — verify preview shows 3 valid, 1 error (missing), 1 error (duplicate).
5. Confirm import — verify skip-summary modal appears for the 2 error rows.
6. Confirm skip — verify 3 participants appear in the list.

---

## Open Questions for Implementation

- Should the `ExcelImportDialog` be a full-page route or a `<Dialog>` modal? **Recommendation**: MUI `<Dialog>` with `fullWidth maxWidth="lg"` to keep the participant list context visible.
- Should import failures (backend errors mid-import) stop the whole batch or continue? **Recommendation**: continue, collect failed rows, show in a post-import summary.
- Column header matching: by fixed index (robust) or by header name (user-friendly but fragile)? **Recommendation**: fixed index — the template enforces the correct structure.
