import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { FabProps } from '@mui/material/Fab';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import Groups2Icon from '@mui/icons-material/Groups2';
// import Backdrop from '@mui/material/Backdrop';
// import { useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { ADVANCED_TAB_INDEX, DISTANCES_TAB_INDEX } from './MapControlsSidebar';
import { useTranslation } from 'react-i18next';

export function MapControlsOverlay() {
  const { dispatch } = useDinnerRouteOverviewContext();
  const { t } = useTranslation(['admin', 'common']);

  // const [open, setOpen] = useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  const isMobileDevice = useIsMobileDevice();

  const openRouteOptimization = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_ROUTE_OPTIMIZATION_DIALOG,
    });
  };

  const resetAll = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.RESET,
    });
  };

  const openHelpDialog = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_HELP_DIALOG,
    });
  };

  const openSidebarView = (tabIndex: number) => {
    dispatch({
      type: DinnerRouteOverviewActionType.OPEN_SIDEBAR,
      payload: tabIndex,
    });
  };

  const fabProps: Partial<FabProps> = {
    sx: { backgroundColor: 'primary.main', width: 64, height: 64 },
  };

  const optimizeLabel = t('admin:dinner_route_optimize_action');
  const distancesLabel = t('common:distances');
  const nearbyHostsAnalysisLabel = t('admin:dinner_route_hosts_near_distance_title_short');
  const resetLabel = t('admin:dinner_route_filter_reset');
  const helpLabel = t('common:help');

  const actions = [
    { icon: <AutoAwesomeIcon />, name: optimizeLabel, onClick: openRouteOptimization },
    { icon: <DirectionsOutlinedIcon />, name: distancesLabel, onClick: () => openSidebarView(DISTANCES_TAB_INDEX) },
    { icon: <Groups2Icon />, name: nearbyHostsAnalysisLabel, onClick: () => openSidebarView(ADVANCED_TAB_INDEX) },
    { icon: <SettingsBackupRestoreIcon />, name: resetLabel, onClick: resetAll },
    { icon: <HelpOutlineIcon />, name: helpLabel, onClick: openHelpDialog },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 10,
      }}
    >
      {/* <Backdrop open={open} /> */}
      <SpeedDial
        FabProps={fabProps}
        ariaLabel="Map controls"
        // onClick={() => setOpen(!open)}
        // onClose={handleClose}
        // onOpen={handleOpen}
        // open={open}
        icon={<SpeedDialIcon openIcon={<CloseIcon />} icon={<EditIcon />} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen={isMobileDevice}
            tooltipPlacement={'right'}
            key={action.name}
            onClick={() => {
              action.onClick();
              // window.setTimeout(() => handleClose(), 100);
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
