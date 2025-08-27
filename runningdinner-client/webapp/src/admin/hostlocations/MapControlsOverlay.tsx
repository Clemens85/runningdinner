import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RouteIcon from '@mui/icons-material/Route';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

type MapControlsOverlayProps = {
  onOpenOptimization: () => void;
  onResetView: () => void;
};

export function MapControlsOverlay({ onOpenOptimization, onResetView }: MapControlsOverlayProps) {
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { isSidebarOpen } = state;

  const toggleSidebar = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SIDEBAR,
    });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 10,
      }}
    >
      <SpeedDial
        ariaLabel="Map controls"
        openIcon={<CloseIcon />}
        icon={<EditIcon />}
        FabProps={{
          sx: { backgroundColor: 'primary.main' },
        }}
      >
        <SpeedDialAction icon={<FilterListIcon />} tooltipTitle={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'} onClick={toggleSidebar} />
        <SpeedDialAction icon={<RouteIcon />} tooltipTitle="Optimize Routes" onClick={onOpenOptimization} />
        <SpeedDialAction icon={<SettingsBackupRestoreIcon />} tooltipTitle="Reset View" onClick={onResetView} />
      </SpeedDial>
    </Box>
  );
}
