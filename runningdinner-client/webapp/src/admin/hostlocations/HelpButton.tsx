import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IconButton, Tooltip } from '@mui/material';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

export function HelpButton() {
  const { dispatch } = useDinnerRouteOverviewContext();
  const { t } = useTranslation('common');

  const label = t('common:help');

  const openHelpDialog = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_HELP_DIALOG,
    });
  };

  return (
    <>
      <Tooltip title={label}>
        <IconButton edge="end" color="inherit" onClick={openHelpDialog} aria-label={label} size="large">
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
