import { Button, ButtonProps } from '@mui/material';
import { isStringNotEmpty, useDinnerRouteOverviewContext, DinnerRouteOverviewActionType } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { useIsRouteOptimization } from './useIsRouteOptimization';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export function RouteOptimizationButton(props: ButtonProps) {
  const { t } = useTranslation(['admin']);

  const { dispatch } = useDinnerRouteOverviewContext();

  const optimizationId = useIsRouteOptimization();
  if (isStringNotEmpty(optimizationId)) {
    return null;
  }

  function handleOpen() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_ROUTE_OPTIMIZATION_DIALOG,
    });
  }

  return (
    <>
      <Button color="inherit" onClick={handleOpen} variant="outlined" disableElevation startIcon={<AutoAwesomeIcon />} {...props}>
        {t('admin:dinner_route_optimize_action')}
      </Button>
    </>
  );
}
