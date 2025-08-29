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

export function MapControlsOverlay() {
  const { dispatch } = useDinnerRouteOverviewContext();

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

  const actions = [
    { icon: <AutoAwesomeIcon />, name: 'Optimierung', onClick: openRouteOptimization },
    { icon: <DirectionsOutlinedIcon />, name: 'Entfernungen', onClick: () => openSidebarView(DISTANCES_TAB_INDEX) },
    { icon: <Groups2Icon />, name: 'Gastgeber Überschneidungen', onClick: () => openSidebarView(ADVANCED_TAB_INDEX) },
    { icon: <SettingsBackupRestoreIcon />, name: 'Sicht zurücksetzen', onClick: resetAll },
    { icon: <HelpOutlineIcon />, name: 'Hilfe', onClick: openHelpDialog },
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
