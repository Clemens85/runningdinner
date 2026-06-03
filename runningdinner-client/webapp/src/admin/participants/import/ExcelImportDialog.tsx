import React from 'react';
import { Alert, Box, Collapse, Dialog, DialogContent, LinearProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { concatParticipantList, generateImportTemplate, hasErrors, hasOnlyErrors, ParticipantList } from '@runningdinner/shared';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import { useIsMobileDevice } from '../../../common/theme/CustomMediaQueryHook';
import DialogActionsPanel from '../../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import SecondaryButton from '../../../common/theme/SecondaryButton';
import { ConfirmationDialog } from '../../../common/theme/dialog/ConfirmationDialog';
import { ImportPreviewTable } from './ImportPreviewTable';
import { useParticipantImport } from './useParticipantImport';

interface ExcelImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  adminId: string;
  participantList: ParticipantList;
}

export function ExcelImportDialog({ open, onClose, onImportComplete, adminId, participantList }: ExcelImportDialogProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess, showError } = useCustomSnackbar();

  const existingParticipants = concatParticipantList(participantList);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedErrors, setExpandedErrors] = React.useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false);
  const isMobileDevice = useIsMobileDevice('md');

  const { step, importPreview, importProgress, importResult, fileError, handleFileSelected, handleConfirmImport, handleReset } = useParticipantImport(
    adminId,
    existingParticipants,
  );

  // When import is done, show snackbar and notify parent
  React.useEffect(() => {
    if (step === 'done' && importResult) {
      if (importResult.failedRows.length === 0) {
        // Full success — notify parent and close
        showSuccess(t('admin:import_success', { count: importResult.succeededCount }));
        onImportComplete();
        handleClose();
      } else if (importResult.succeededCount > 0) {
        // Partial success — notify parent (list updated) but stay open to show error rows
        showError(
          t('admin:import_partial_success', {
            success: importResult.succeededCount,
            failed: importResult.failedRows.length,
          }),
        );
        onImportComplete();
        // Dialog stays open in 'done' step to show the failed row list
      }
      // If everything failed, just show the error summary inline (no snackbar needed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, importResult]);

  function handleClose() {
    setShowSkipConfirm(false);
    handleReset();
    onClose();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // --- Step: idle / parsing ---
  if (step === 'idle' || step === 'parsing') {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitleCloseable onClose={handleClose}>{t('admin:import_participants_title')}</DialogTitleCloseable>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              {t('admin:import_description')}
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {t('admin:import_template_info')}
              </Typography>
              <SecondaryButton
                startIcon={<DownloadIcon />}
                onClick={generateImportTemplate}
                data-testid="import-download-template-btn"
                size="small"
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {t('admin:import_download_template')}
              </SecondaryButton>
            </Box>
            {fileError && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {t(`admin:${fileError}`)}
              </Typography>
            )}
            {step === 'parsing' && <LinearProgress sx={{ mt: 2 }} />}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              id="excel-import-file-input"
              onChange={handleFileInputChange}
              data-testid="import-file-input"
            />
          </Box>
        </DialogContent>
        <DialogActionsPanel
          onOk={() => fileInputRef.current?.click()}
          okLabel={t('admin:import_select_file')}
          onCancel={handleClose}
          cancelLabel={t('common:cancel')}
          okButtonDisabled={step === 'parsing'}
        />
      </Dialog>
    );
  }

  // --- Step: previewing ---
  if (step === 'previewing' && importPreview) {
    const noImportableRows = hasOnlyErrors(importPreview);
    const hasErrorRows = hasErrors(importPreview);
    const importableCount = importPreview.rows.filter((r) => r.status !== 'ERROR').length;

    return (
      <>
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth fullScreen={isMobileDevice}>
          <DialogTitleCloseable onClose={handleClose}>{t('admin:import_preview_step_title')}</DialogTitleCloseable>
          <DialogContent>
            <ImportPreviewTable preview={importPreview} />
          </DialogContent>
          <DialogActionsPanel
            onOk={() => {
              if (hasErrorRows) {
                setShowSkipConfirm(true);
              } else {
                handleConfirmImport();
              }
            }}
            okLabel={t('admin:import_preview_confirm', { count: importableCount })}
            onCancel={handleClose}
            cancelLabel={t('common:cancel')}
            okButtonDisabled={noImportableRows}
          />
        </Dialog>
        {showSkipConfirm && (
          <ConfirmationDialog
            open={true}
            onClose={(confirmed) => {
              setShowSkipConfirm(false);
              if (confirmed) {
                handleConfirmImport();
              }
            }}
            dialogTitle={t('admin:import_participants_title')}
            dialogContent={<Alert severity="warning">{t('admin:import_skipped_rows_summary', { count: importPreview.counts.errors })}</Alert>}
            buttonConfirmText={t('admin:import_preview_confirm', { count: importableCount })}
            buttonCancelText={t('common:cancel')}
          />
        )}
      </>
    );
  }

  // --- Step: importing ---
  if (step === 'importing') {
    const pct = importProgress && importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0;

    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitleCloseable>{t('admin:import_participants_title')}</DialogTitleCloseable>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('admin:import_importing_progress')}
          </Typography>
          {importProgress && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {importProgress.current} / {importProgress.total}
            </Typography>
          )}
          <LinearProgress variant="determinate" value={pct} data-testid="import-progress-bar" />
        </DialogContent>
      </Dialog>
    );
  }

  // --- Step: done (only shown when some rows failed) ---
  if (step === 'done' && importResult && importResult.failedRows.length > 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitleCloseable onClose={handleClose}>{t('admin:import_participants_title')}</DialogTitleCloseable>
        <DialogContent>
          <Alert severity={importResult.succeededCount > 0 ? 'warning' : 'error'} sx={{ mb: 2 }}>
            {importResult.succeededCount > 0
              ? t('admin:import_partial_success', {
                  success: importResult.succeededCount,
                  failed: importResult.failedRows.length,
                })
              : t('admin:import_partial_success', {
                  success: 0,
                  failed: importResult.failedRows.length,
                })}
          </Alert>
          <SecondaryButton size="small" onClick={() => setExpandedErrors((v) => !v)}>
            {expandedErrors ? '▲' : '▼'} {t('admin:import_skipped_rows_summary', { count: importResult.failedRows.length })}
          </SecondaryButton>
          <Collapse in={expandedErrors}>
            <List dense>
              {importResult.failedRows.map(({ row, error }) => (
                <ListItem key={row.rowNumber} disableGutters sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={`${t('admin:import_row_number', { nr: row.rowNumber })} — ${row.data.firstnamePart} ${row.data.lastname}`}
                    secondary={error}
                    slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption', color: 'error' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </DialogContent>
        <DialogActionsPanel onOk={handleClose} okLabel={t('common:ok')} onCancel={handleClose} cancelLabel={t('common:cancel')} />
      </Dialog>
    );
  }

  return null;
}
