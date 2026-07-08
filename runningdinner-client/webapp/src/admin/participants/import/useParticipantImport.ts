import { buildImportPreview, ExcelImportMappingService, getImportableRows, getUpdatableRows, ImportPreview, ImportResult, isFileExtensionAllowed } from '@runningdinner/shared';
import { ExcelImportRow, ExcelImportRowData } from '@runningdinner/shared';
import { isHttpError, Participant, saveParticipantAsync, useBackendIssueHandler } from '@runningdinner/shared';
import { ImportError, parseExcelFile } from '@runningdinner/shared';
import { ExcelImportValidationService } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  allowUpdateExisting: boolean;
  setAllowUpdateExisting: (value: boolean) => void;
  handleFileSelected: (file: File) => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  handleReset: () => void;
}

export function useParticipantImport(adminId: string, existingParticipants: Participant[]): UseParticipantImportResult {
  const { t } = useTranslation(['admin']);
  const { getIssuesTranslated } = useBackendIssueHandler({ defaultTranslationResolutionSettings: { namespaces: ['admin'] } });
  const [step, setStep] = React.useState<ImportStep>('idle');
  const [importPreview, setImportPreview] = React.useState<ImportPreview | null>(null);
  const [importProgress, setImportProgress] = React.useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [allowUpdateExisting, setAllowUpdateExisting] = React.useState(false);

  const handleFileSelected = React.useCallback(
    async (file: File) => {
      if (!isFileExtensionAllowed(file)) {
        setFileError('import_invalid_file_type');
        return;
      }
      setFileError(null);
      setStep('parsing');
      try {
        const validationService = new ExcelImportValidationService(existingParticipants, t);
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
    [existingParticipants, t],
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
          // If this row targets an existing participant, set its id so saveParticipantAsync
          // issues a PUT. Also clear teamPartnerWishRegistrationData — on update we only
          // update the root participant and leave the child record untouched.
          if (row.existingParticipantId) {
            participant.id = row.existingParticipantId;
            participant.teamPartnerWishRegistrationData = undefined;
          }
          await saveParticipantAsync(adminId, participant);
          // Fixed partner registration creates an additional participant on the backend side
          succeededCount += !row.existingParticipantId && participant.teamPartnerWishRegistrationData ? 2 : 1;
        } catch (e: unknown) {
          let errMsg: string;
          if (isHttpError(e)) {
            const issues = getIssuesTranslated(e);
            const allMessages = [...issues.issuesWithoutField, ...issues.issuesFieldRelated].map((issue) => issue.error.message).filter(Boolean);
            errMsg = allMessages.length > 0 ? allMessages.join(', ') : t('admin:import_partial_success', { success: 0, failed: 1 });
          } else {
            errMsg = e instanceof Error ? e.message : String(e);
          }
          failedRows.push({ row, error: errMsg });
        }
        setImportProgress({ current: i + 1, total: rows.length });
      }

      const result: ImportResult = { succeededCount, failedRows };
      setImportResult(result);
      setStep('done');
    },
    [adminId, getIssuesTranslated, t],
  );

  const handleConfirmImport = React.useCallback(async () => {
    if (!importPreview) return;
    const rows = [...getImportableRows(importPreview), ...(allowUpdateExisting ? getUpdatableRows(importPreview) : [])];
    await doImport(rows);
  }, [importPreview, allowUpdateExisting, doImport]);

  const handleReset = React.useCallback(() => {
    setStep('idle');
    setImportPreview(null);
    setImportProgress(null);
    setImportResult(null);
    setFileError(null);
    setAllowUpdateExisting(false);
  }, []);

  return {
    step,
    importPreview,
    importProgress,
    importResult,
    fileError,
    allowUpdateExisting,
    setAllowUpdateExisting,
    handleFileSelected,
    handleConfirmImport,
    handleReset,
  };
}
