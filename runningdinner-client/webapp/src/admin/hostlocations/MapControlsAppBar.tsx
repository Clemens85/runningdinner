import { Toolbar, Tooltip, IconButton, styled, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { t } from 'i18next';
import MenuIcon from '@mui/icons-material/Menu';
import { SIDEBAR_WIDTH } from './MapControlsSidebar.tsx';
import { HelpButton } from './HelpButton';
import { RouteOptimizationButton } from './RouteOptimizationButton';
import { UnresolvedGeocodesNotificationButton } from './UnresolvedGeocodesNotificationButton';
import { UnresolvedGeocodesWarningAlertProps } from '../../common/dinnerroute';

interface CustomAppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const CustomAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<CustomAppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  color: '#fff',
  backgroundColor: theme.palette.primary.main,
  height: 48,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        marginLeft: `${SIDEBAR_WIDTH}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export function MapControlsAppBar({ teamsWithUnresolvedGeocodings }: UnresolvedGeocodesWarningAlertProps) {
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { isSidebarOpen, showTeamPaths, showTeamClusters } = state;

  const toggleSidebar = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SIDEBAR,
    });
  };

  function onToggleShowTeamClusters(showTeamClusters: boolean) {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_CLUSTERS,
      payload: showTeamClusters,
    });
  }

  function onToggleShowTeamPaths(showTeamPaths: boolean) {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_PATHS,
      payload: showTeamPaths,
    });
  }

  return (
    <CustomAppBar position="static" elevation={0} open={!!isSidebarOpen}>
      <Toolbar variant="dense">
        <IconButton color="inherit" onClick={toggleSidebar} sx={{ mr: 2, ml: -1.5 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('admin:hostlocations_overview')}
        </Typography>

        <Tooltip title={t('admin:hostlocations_team_connections_enable')}>
          <FormGroup>
            <FormControlLabel
              control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamPaths(evt.target.checked)} checked={showTeamPaths} size="small" />}
              label={t('admin:hostlocations_team_connections_enable')}
            />
          </FormGroup>
        </Tooltip>

        <Tooltip title={t('admin:hostlocations_team_cluster_view_enable')}>
          <FormGroup>
            <FormControlLabel
              control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamClusters(evt.target.checked)} checked={showTeamClusters} size="small" />}
              label={t('admin:hostlocations_team_cluster_view_enable')}
            />
          </FormGroup>
        </Tooltip>

        <RouteOptimizationButton sx={{ mx: 2 }} />

        <UnresolvedGeocodesNotificationButton teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} />

        <HelpButton />
      </Toolbar>
    </CustomAppBar>
  );
}
