import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExcelImportRow, ImportPreview } from '@runningdinner/shared';

interface ImportSkipConfirmDialogProps {
  open: boolean;
  preview: ImportPreview;
  onBack: () => void;
  onConfirm: () => void;
}

export function ImportSkipConfirmDialog({
  open,
  preview,
  onBack,
  onConfirm,
}: ImportSkipConfirmDialogProps) {
  const { t } = useTranslation(['admin', 'common']);

  const errorRows = preview.rows.filter((r) => r.status === 'ERROR');
  const importableCount = preview.rows.filter((r) => r.status !== 'ERROR').length;

  function renderRowSummary(row: ExcelImportRow) {
    const primaryText = t('admin:import_row_number', { nr: row.rowNumber });
    const secondaryText = row.validationMessages
      .filter((m) => m.message)
      .map((m) => m.message)
      .join('; ');
    return (
      <ListItem key={row.rowNumber} disableGutters sx={{ py: 0.25 }}>
        <ListItemText
          primary={`${primaryText} — ${row.data.firstnamePart} ${row.data.lastname} (${row.data.email})`}
          secondary={secondaryText}
          slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption', color: 'error' } }}
        />
      </ListItem>
    );
  }

  return (
    <Dialog open={open} onClose={onBack} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin:import_participants_title')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          {t('admin:import_skipped_rows_summary', { count: errorRows.length })}
        </Typography>
        <List dense disablePadding>
          {errorRows.map(renderRowSummary)}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} color="inherit" data-testid="import-skip-back-btn">
          {t('admin:import_back_to_preview')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          data-testid="import-skip-confirm-btn"
          disabled={importableCount === 0}
        >
          {t('admin:import_preview_confirm_with_skipped', {
            count: importableCount,
            skipped: errorRows.length,
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
