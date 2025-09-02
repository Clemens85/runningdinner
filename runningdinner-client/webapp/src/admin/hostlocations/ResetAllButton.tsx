import { Button } from '@mui/material';
import { useDinnerRouteOverviewContext, DinnerRouteOverviewActionType } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

export function ResetAllButton() {
  const { dispatch } = useDinnerRouteOverviewContext();

  const { t } = useTranslation(['admin', 'common']);
  const isMobileDevice = useIsMobileDevice();

  function handleReset() {
    dispatch({
      type: DinnerRouteOverviewActionType.RESET,
    });
  }

  return (
    <Button startIcon={<SettingsBackupRestoreIcon />} variant="outlined" sx={{ mr: 2 }} color="inherit" size="small" onClick={handleReset}>
      {t(isMobileDevice ? 'common:reset' : 'admin:dinner_route_filter_reset')}
    </Button>
  );
}
