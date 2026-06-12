import { buildImportPreview, ExcelImportMappingService, getImportableRows, ImportPreview, ImportResult, isFileExtensionAllowed } from '@runningdinner/shared';
import { ExcelImportRow, ExcelImportRowData } from '@runningdinner/shared';
import { Participant, saveParticipantAsync } from '@runningdinner/shared';
import { ImportError, parseExcelFile } from '@runningdinner/shared';
import { ExcelImportValidationService } from '@runningdinner/shared';
import React from 'react';

export type ImportStep = 'idle' | 'parsing' | 'previewing' | 'importing' | 'done';

export interface ImportProgress {
  current: number;
  total: number;
}

export interface UseParticipantImportResult {
  step: ImportStep;
  importPreview: ImportPreview | null;
  importProgress: ImportProgress | null;
  importResult: ImportResult | null;
  fileError: string | null;
  handleFileSelected: (file: File) => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  handleReset: () => void;
}

export function useParticipantImport(adminId: string, existingParticipants: Participant[]): UseParticipantImportResult {
  const [step, setStep] = React.useState<ImportStep>('idle');
  const [importPreview, setImportPreview] = React.useState<ImportPreview | null>(null);
  const [importProgress, setImportProgress] = React.useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const handleFileSelected = React.useCallback(
    async (file: File) => {
      const validationService = new ExcelImportValidationService(existingParticipants);
      if (!isFileExtensionAllowed(file)) {
        setFileError('import_invalid_file_type');
        return;
      }
      setFileError(null);
      setStep('parsing');
      try {
        const rawRows: ExcelImportRowData[] = await parseExcelFile(file);
        const validatedRows: ExcelImportRow[] = validationService.validateImportRows(rawRows);
        const preview = buildImportPreview(validatedRows);
        setImportPreview(preview);
        setStep('previewing');
      } catch (e) {
        if (e instanceof ImportError) {
          setFileError(e.code === 'NO_DATA_ROWS' ? 'import_no_data_rows' : 'import_invalid_file_type');
        } else {
          setFileError('import_invalid_file_type');
        }
        setStep('idle');
      }
    },
    [existingParticipants],
  );

  const doImport = React.useCallback(
    async (rows: ExcelImportRow[]) => {
      setImportProgress({ current: 0, total: rows.length });
      setStep('importing');

      const failedRows: ImportResult['failedRows'] = [];
      let succeededCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const participant = ExcelImportMappingService.buildParticipantFromImportRow(row.data);
          await saveParticipantAsync(adminId, participant);
          succeededCount++;
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          failedRows.push({ row, error: errMsg });
        }
        setImportProgress({ current: i + 1, total: rows.length });
      }

      const result: ImportResult = { succeededCount, failedRows };
      setImportResult(result);
      setStep('done');
    },
    [adminId],
  );

  const handleConfirmImport = React.useCallback(async () => {
    if (!importPreview) return;
    const rows = getImportableRows(importPreview);
    await doImport(rows);
  }, [importPreview, doImport]);

  const handleReset = React.useCallback(() => {
    setStep('idle');
    setImportPreview(null);
    setImportProgress(null);
    setImportResult(null);
    setFileError(null);
  }, []);

  return {
    step,
    importPreview,
    importProgress,
    importResult,
    fileError,
    handleFileSelected,
    handleConfirmImport,
    handleReset,
  };
}
