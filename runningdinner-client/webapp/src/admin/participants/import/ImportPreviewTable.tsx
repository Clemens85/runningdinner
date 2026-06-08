import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Alert, Box, Chip, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { buildParticipantFromImportRow, ExcelImportRow, ExcelImportRowStatus, Fullname, ImportPreview } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ParticipantMealBadges } from '../meal/ParticipantMealBadges.tsx';

function formatSeats(numSeats: string): string {
  const n = parseInt(numSeats, 10);
  return n > 0 ? String(n) : '—';
}

function statusColor(status: ExcelImportRowStatus): 'success' | 'warning' | 'error' | 'default' {
  if (status === 'VALID') return 'success';
  if (status === 'WARNING') return 'warning';
  return 'error';
}

function statusLabel(status: ExcelImportRowStatus, t: (k: string) => string): string {
  if (status === 'VALID') return t('admin:import_preview_valid');
  if (status === 'WARNING') return t('admin:import_preview_warning');
  return t('admin:import_preview_error');
}

interface RowProps {
  row: ExcelImportRow;
}

function MobileRow({ row }: RowProps) {
  const { t } = useTranslation(['admin']);
  const [open, setOpen] = React.useState(false);
  const hasMessages = row.validationMessages.length > 0;

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: row.status === 'ERROR' ? 'error.main' : row.status === 'WARNING' ? 'warning.main' : 'divider',
        bgcolor: row.status === 'ERROR' ? 'error.light' : row.status === 'WARNING' ? 'warning.light' : undefined,
        opacity: row.status === 'ERROR' ? 0.85 : 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            #{row.rowNumber} — <Fullname firstnamePart={row.data.firstnamePart} lastname={row.data.lastname} />
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {row.data.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Chip label={statusLabel(row.status, t)} color={statusColor(row.status)} size="small" />
          {hasMessages && (
            <IconButton size="small" onClick={() => setOpen((v) => !v)} aria-label="expand row">
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      </Box>
      {hasMessages && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {row.validationMessages.map((msg, idx) => (
              <Typography key={idx} variant="caption" color={row.status === 'ERROR' ? 'error.dark' : 'warning.dark'} display="block">
                {msg.field ? `[${msg.field}] ` : ''}
                {msg.message}
              </Typography>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function DesktopRow({ row }: RowProps) {
  const { t } = useTranslation(['admin']);
  const [open, setOpen] = React.useState(false);
  const hasMessages = row.validationMessages.length > 0;

  const address = [row.data.street, row.data.streetNr].filter(Boolean).join(' ');
  const cityLine = [row.data.zip, row.data.cityName].filter(Boolean).join(' ');
  const fullAddress = [address, cityLine].filter(Boolean).join(', ');

  return (
    <>
      <TableRow
        sx={{
          bgcolor: row.status === 'ERROR' ? 'error.light' : row.status === 'WARNING' ? 'warning.light' : undefined,
          opacity: row.status === 'ERROR' ? 0.85 : 1,
        }}
      >
        <TableCell sx={{ width: 40, p: 0.5 }}>
          {hasMessages ? (
            <IconButton size="small" onClick={() => setOpen((prev) => !prev)} aria-label="expand row">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          ) : null}
        </TableCell>
        <TableCell>#{row.rowNumber}</TableCell>
        <TableCell>
          <Fullname firstnamePart={row.data.firstnamePart} lastname={row.data.lastname} />
        </TableCell>
        <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{fullAddress}</TableCell>
        <TableCell>{row.data.email}</TableCell>
        <TableCell align="center">{formatSeats(row.data.numSeats)}</TableCell>
        <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>
          <MealSpecificsPreview {...row} />
        </TableCell>
        <TableCell>
          <Chip label={statusLabel(row.status, t)} color={statusColor(row.status)} size="small" />
        </TableCell>
      </TableRow>
      {hasMessages && (
        <TableRow>
          <TableCell colSpan={8} sx={{ py: 0, pl: 6 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 1 }}>
                {row.validationMessages.map((msg, idx) => (
                  <Typography key={idx} variant="body2" color={row.status === 'ERROR' ? 'error.dark' : 'warning.dark'} sx={{ mb: 0.25 }}>
                    {msg.field ? `[${msg.field}] ` : ''}
                    {msg.message}
                  </Typography>
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function MealSpecificsPreview({ data }: ExcelImportRow) {
  try {
    const participant = buildParticipantFromImportRow(data);
    return <ParticipantMealBadges participant={participant} />;
  } catch (error) {
    // This can happen if the row cannot be parsed to a participant after all
    return null;
  }
}

interface ImportPreviewTableProps {
  preview: ImportPreview;
}

export function ImportPreviewTable({ preview }: ImportPreviewTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { counts } = preview;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip label={`${t('admin:import_total')}: ${counts.total}`} size="small" />
        {counts.valid > 0 && <Chip label={`${t('admin:import_preview_valid')}: ${counts.valid}`} color="success" size="small" />}
        {counts.warnings > 0 && <Chip label={`${t('admin:import_preview_warning')}: ${counts.warnings}`} color="warning" size="small" />}
        {counts.errors > 0 && <Chip label={`${t('admin:import_preview_error')}: ${counts.errors}`} color="error" size="small" />}
      </Box>

      {isMobile ? (
        <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 0.5 }}>
          {preview.rows.map((row) => (
            <MobileRow key={row.rowNumber} row={row} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table stickyHeader size="small" data-testid="import-preview-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell>{t('admin:import_column_row')}</TableCell>
                <TableCell>{t('admin:import_column_name')}</TableCell>
                <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{t('admin:import_column_address')}</TableCell>
                <TableCell>{t('common:email')}</TableCell>
                <TableCell align="center">{t('common:number_seats')}</TableCell>
                <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{t('common:mealspecifics')}</TableCell>
                <TableCell>{t('admin:import_column_status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.rows.map((row) => (
                <DesktopRow key={row.rowNumber} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {counts.errors > 0 && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {t('admin:import_preview_errors_hint', { count: counts.errors })}
        </Alert>
      )}
    </Box>
  );
}
