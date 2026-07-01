import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Alert, Box, Chip, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ExcelImportMappingService, ExcelImportRow, ExcelImportRowStatus, ExcelImportValidationMessage, Fullname, ImportPreview } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ParticipantMealBadges } from '../meal/ParticipantMealBadges';

function formatSeats(numSeats: string): string {
  const n = parseInt(numSeats, 10);
  return n > 0 ? String(n) : '—';
}

function statusColor(status: ExcelImportRowStatus): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (status === 'VALID') return 'success';
  if (status === 'INFO') return 'info';
  if (status === 'WARNING') return 'warning';
  return 'error';
}

function messageColor(severity: ExcelImportValidationMessage['severity']): string {
  if (severity === 'ERROR') return 'error.dark';
  if (severity === 'WARNING') return 'warning.dark';
  return 'info.main';
}

function statusLabel(status: ExcelImportRowStatus, t: (k: string) => string): string {
  if (status === 'VALID') return t('admin:import_preview_valid');
  if (status === 'INFO') return t('admin:import_preview_info');
  if (status === 'WARNING') return t('admin:import_preview_warning');
  return t('admin:import_preview_error');
}

function hasFixedPartner(row: ExcelImportRow): boolean {
  return row.data.teamPartnerWishPartnerFirstname.trim() !== '';
}

interface RowProps {
  row: ExcelImportRow;
  isUpdating?: boolean;
}

function MobileRow({ row, isUpdating }: RowProps) {
  const { t } = useTranslation(['admin']);
  const [open, setOpen] = React.useState(false);
  const hasMessages = !isUpdating && row.validationResult.messages.length > 0;

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor:
          row.validationResult.status === 'ERROR' && !isUpdating
            ? 'error.main'
            : row.validationResult.status === 'WARNING'
              ? 'warning.main'
              : row.validationResult.status === 'INFO'
                ? 'info.main'
                : 'divider',
        bgcolor:
          row.validationResult.status === 'ERROR' && !isUpdating
            ? 'error.light'
            : row.validationResult.status === 'WARNING'
              ? 'warning.light'
              : row.validationResult.status === 'INFO'
                ? 'info.light'
                : undefined,
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
          {hasFixedPartner(row) && (
            <Typography variant="caption" color="text.secondary" display="block">
              +&nbsp;
              <Fullname firstnamePart={row.data.teamPartnerWishPartnerFirstname} lastname={row.data.teamPartnerWishPartnerLastname} />
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {isUpdating ? (
            <Chip label={t('admin:import_preview_update')} color="success" size="small" />
          ) : (
            <Chip label={statusLabel(row.validationResult.status, t)} color={statusColor(row.validationResult.status)} size="small" />
          )}
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
            {row.validationResult.messages.map((msg, idx) => (
              <Typography key={idx} variant="caption" color={messageColor(msg.severity)} display="block">
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

function DesktopRow({ row, isUpdating }: RowProps) {
  const { t } = useTranslation(['admin']);
  const [open, setOpen] = React.useState(false);
  const hasMessages = !isUpdating && row.validationResult.messages.length > 0;

  const address = [row.data.street, row.data.streetNr].filter(Boolean).join(' ');
  const cityLine = [row.data.zip, row.data.cityName].filter(Boolean).join(' ');
  const fullAddress = [address, cityLine].filter(Boolean).join(', ');

  return (
    <>
      <TableRow
        sx={{
          bgcolor:
            row.validationResult.status === 'ERROR' && !isUpdating
              ? 'error.light'
              : row.validationResult.status === 'WARNING'
                ? 'warning.light'
                : row.validationResult.status === 'INFO'
                  ? 'info.light'
                  : undefined,
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
          {hasFixedPartner(row) && (
            <Typography variant="caption" color="text.secondary" display="block">
              +&nbsp;
              <Fullname firstnamePart={row.data.teamPartnerWishPartnerFirstname} lastname={row.data.teamPartnerWishPartnerLastname} />
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{fullAddress}</TableCell>
        <TableCell>{row.data.email}</TableCell>
        <TableCell align="center">{formatSeats(row.data.numSeats)}</TableCell>
        <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>
          <MealSpecificsPreview {...row} />
        </TableCell>
        <TableCell>
          {isUpdating ? (
            <Chip label={t('admin:import_preview_update')} color="success" size="small" />
          ) : (
            <Chip label={statusLabel(row.validationResult.status, t)} color={statusColor(row.validationResult.status)} size="small" />
          )}
        </TableCell>
      </TableRow>
      {hasMessages && (
        <TableRow>
          <TableCell colSpan={8} sx={{ py: 0, pl: 6 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 1 }}>
                {row.validationResult.messages.map((msg, idx) => (
                  <Typography key={idx} variant="body2" color={messageColor(msg.severity)} sx={{ mb: 0.25 }}>
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
    const participant = ExcelImportMappingService.buildParticipantFromImportRow(data);
    return <ParticipantMealBadges participant={participant} />;
  } catch (error) {
    // This can happen if the row cannot be parsed to a participant after all
    return null;
  }
}

interface ImportPreviewTableProps {
  preview: ImportPreview;
  /** Row numbers that should be displayed as "will be updated" instead of as errors */
  updatingRowNumbers?: Set<number>;
}

export function ImportPreviewTable({ preview, updatingRowNumbers }: ImportPreviewTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const updatingCount = updatingRowNumbers?.size ?? 0;

  // Counts for the summary chips — updating rows are counted separately, not as errors
  const displayCounts = preview.rows.reduce(
    (acc, row) => {
      if (updatingRowNumbers?.has(row.rowNumber)) return acc;
      const status = row.validationResult.status;
      if (status === 'VALID') acc.valid++;
      else if (status === 'INFO') acc.infos++;
      else if (status === 'WARNING') acc.warnings++;
      else acc.errors++;
      return acc;
    },
    { valid: 0, infos: 0, warnings: 0, errors: 0 },
  );

  const fixedTeamPartnerRegistrationsCount = preview.rows.filter((r) => r.validationResult.status !== 'ERROR' && r.data.teamPartnerWishPartnerFirstname.trim() !== '').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip label={`${t('admin:import_total')}: ${preview.counts.total}`} size="small" />
        {displayCounts.valid > 0 && <Chip label={`${t('admin:import_preview_valid')}: ${displayCounts.valid}`} color="success" size="small" />}
        {displayCounts.infos > 0 && <Chip label={`${t('admin:import_preview_info')}: ${displayCounts.infos}`} color="info" size="small" />}
        {displayCounts.warnings > 0 && <Chip label={`${t('admin:import_preview_warning')}: ${displayCounts.warnings}`} color="warning" size="small" />}
        {displayCounts.errors > 0 && <Chip label={`${t('admin:import_preview_error')}: ${displayCounts.errors}`} color="error" size="small" />}
        {updatingCount > 0 && <Chip label={t('admin:import_preview_updating_chip', { count: updatingCount })} color="success" size="small" variant="outlined" />}
        {fixedTeamPartnerRegistrationsCount > 0 && (
          <Chip label={t('admin:import_preview_fixed_partners_chip', { count: fixedTeamPartnerRegistrationsCount })} size="small" variant="outlined" />
        )}
      </Box>

      {isMobile ? (
        <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 0.5 }}>
          {preview.rows.map((row) => (
            <MobileRow key={row.rowNumber} row={row} isUpdating={updatingRowNumbers?.has(row.rowNumber)} />
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
                <DesktopRow key={row.rowNumber} row={row} isUpdating={updatingRowNumbers?.has(row.rowNumber)} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {displayCounts.errors > 0 && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {t('admin:import_preview_errors_hint', { count: displayCounts.errors })}
        </Alert>
      )}
    </Box>
  );
}
