import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Box, CircularProgress, Collapse, Dialog, DialogContent, LinearProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { concatParticipantList, generateImportTemplate, getAllowedImportFileTypesAcceptString, hasOnlyErrors, ParticipantList } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobileDevice } from '../../../common/theme/CustomMediaQueryHook';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import DialogActionsPanel from '../../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import SecondaryButton from '../../../common/theme/SecondaryButton';
import { ImportPreviewTable } from './ImportPreviewTable';
import { useParticipantImport } from './useParticipantImport';

interface ExcelImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  adminId: string;
  participantList?: ParticipantList;
}

export function ExcelImportDialog({ open, onClose, onImportComplete, adminId, participantList }: ExcelImportDialogProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess } = useCustomSnackbar();

  const existingParticipants = concatParticipantList(participantList);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedErrors, setExpandedErrors] = React.useState(false);
  const [isSelectingFile, setIsSelectingFile] = React.useState(false);
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
        // Partial success — notify parent (list updated) but stay open to show error rows inline
        onImportComplete();
      }
      // If everything failed, just show the error summary inline (no snackbar needed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, importResult]);

  function handleClose() {
    // setShowSkipConfirm(false);
    handleReset();
    onClose();
  }

  function handleSelectFileClick() {
    setIsSelectingFile(true);
    // Detect when the OS file picker closes (with or without a selection)
    const handleWindowFocus = () => {
      window.removeEventListener('focus', handleWindowFocus);
      // Small delay so onChange fires before we clear the state
      setTimeout(() => setIsSelectingFile(false), 300);
    };
    window.addEventListener('focus', handleWindowFocus);
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsSelectingFile(false);
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
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
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
              <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                {t('admin:import_template_hints_sheet')}
              </Alert>
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
              accept={getAllowedImportFileTypesAcceptString()}
              style={{ display: 'none' }}
              id="excel-import-file-input"
              onChange={handleFileInputChange}
              data-testid="import-file-input"
            />
          </Box>
        </DialogContent>
        <DialogActionsPanel
          onOk={handleSelectFileClick}
          okLabel={
            isSelectingFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {t('admin:import_select_file')}
              </Box>
            ) : (
              t('admin:import_select_file')
            )
          }
          onCancel={handleClose}
          cancelLabel={t('common:cancel')}
          okButtonDisabled={step === 'parsing' || isSelectingFile}
        />
      </Dialog>
    );
  }

  // --- Step: previewing ---
  if (step === 'previewing' && importPreview) {
    const noImportableRows = hasOnlyErrors(importPreview);
    const importableRows = importPreview.rows.filter((r) => r.validationResult.status !== 'ERROR');
    const autoPartnersCount = importableRows.filter((r) => r.data.teamPartnerWishPartnerFirstname.trim() !== '').length;
    const importableCount = importableRows.length + autoPartnersCount;

    return (
      <>
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth fullScreen={isMobileDevice}>
          <DialogTitleCloseable onClose={handleClose}>{t('admin:import_preview_step_title')}</DialogTitleCloseable>
          <DialogContent>
            {!isMobileDevice && (
              <Alert severity="info" variant="outlined" sx={{ mb: 2, py: 0.5 }}>
                {t('admin:import_preview_columns_hint')}
              </Alert>
            )}
            <ImportPreviewTable preview={importPreview} />
          </DialogContent>
          <DialogActionsPanel
            onOk={() => handleConfirmImport()}
            okLabel={t('admin:import_preview_confirm', { count: importableCount })}
            onCancel={handleClose}
            cancelLabel={t('common:cancel')}
            okButtonDisabled={noImportableRows}
          />
        </Dialog>
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
