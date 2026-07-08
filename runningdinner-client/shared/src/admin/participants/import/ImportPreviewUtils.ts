import { ExcelImportRow, ImportPreview } from './types';

export function buildImportPreview(rows: ExcelImportRow[]): ImportPreview {
  const counts = rows.reduce(
    (acc, row) => {
      acc.total++;
      const status = row.validationResult.status;
      if (status === 'VALID') acc.valid++;
      else if (status === 'INFO') acc.infos++;
      else if (status === 'WARNING') acc.warnings++;
      else acc.errors++;
      return acc;
    },
    { total: 0, valid: 0, infos: 0, warnings: 0, errors: 0 },
  );
  return { rows, counts };
}

export function getImportableRows(preview: ImportPreview): ExcelImportRow[] {
  return preview.rows.filter((r) => r.validationResult.status !== 'ERROR');
}

/**
 * Returns rows that are eligible for an "update existing participant" operation:
 * - The row matched an existing participant by email (`existingParticipantId` is set)
 * - The only ERROR-severity message is the duplicate-existing one (no other field errors)
 */
export function getUpdatableRows(preview: ImportPreview): ExcelImportRow[] {
  return preview.rows.filter((r) => {
    if (!r.existingParticipantId) {
      return false;
    }
    const errorMessages = r.validationResult.messages.filter((m) => m.severity === 'ERROR');
    return errorMessages.length === 1 && errorMessages[0].field === 'email';
  });
}

export function hasOnlyErrors(preview: ImportPreview): boolean {
  return preview.counts.errors === preview.counts.total;
}
