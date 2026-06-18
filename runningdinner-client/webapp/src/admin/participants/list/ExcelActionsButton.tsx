import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import { getParticipantsExportUrl } from '@runningdinner/shared';
import DropdownButton from '../../../common/theme/dropdown/DropdownButton';
import DropdownButtonItem from '../../../common/theme/dropdown/DropdownButtonItem';

interface ExcelActionsButtonProps {
  adminId: string;
  onImportClick: () => void;
  showExport: boolean;
}

export function ExcelActionsButton({ adminId, onImportClick, showExport }: ExcelActionsButtonProps) {
  const { t } = useTranslation(['admin']);

  return (
    <DropdownButton label={t('admin:excel_data_actions')} data-testid="excel-actions-btn">
      {showExport && (
        <DropdownButtonItem onClick={() => window.open(getParticipantsExportUrl(adminId), '_blank', 'noopener,noreferrer')} data-testid="excel-export-menu-item">
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          {t('admin:export')}
        </DropdownButtonItem>
      )}
      <DropdownButtonItem onClick={onImportClick} data-testid="excel-import-menu-item">
        <UploadFileIcon fontSize="small" sx={{ mr: 1 }} />
        {t('admin:import')}
      </DropdownButtonItem>
    </DropdownButton>
  );
}
