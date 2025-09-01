import { Toolbar, Tooltip, IconButton, styled, FormControlLabel, FormGroup, Switch, Typography, Box } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { t } from 'i18next';
import MenuIcon from '@mui/icons-material/Menu';
import { HelpButton } from './HelpButton';
import { RouteOptimizationButton } from './RouteOptimizationButton';
import { UnresolvedGeocodesNotificationButton } from './UnresolvedGeocodesNotificationButton';
import { UnresolvedGeocodesWarningAlertProps } from '../../common/dinnerroute';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import GridViewIcon from '@mui/icons-material/GridView';
import FeedbackIcon from '@mui/icons-material/Feedback';

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
  // variants: [
  //   {
  //     props: ({ open }) => open,
  //     style: {
  //       width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  //       marginLeft: `${SIDEBAR_WIDTH}px`,
  //       transition: theme.transitions.create(['margin', 'width'], {
  //         easing: theme.transitions.easing.easeOut,
  //         duration: theme.transitions.duration.enteringScreen,
  //       }),
  //     },
  //   },
  // ],
}));

type MapControlsAppBarProps = {
  numberOfClusters: number;
} & UnresolvedGeocodesWarningAlertProps;

export function MapControlsAppBar({ teamsWithUnresolvedGeocodings, numberOfClusters }: MapControlsAppBarProps) {
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { isSidebarOpen, showTeamPaths, showTeamClusters } = state;
  const isMobileDevice = useIsMobileDevice();

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

        {!isMobileDevice && (
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('admin:hostlocations_overview')}
          </Typography>
        )}

        {isMobileDevice && (
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            &nbsp;
          </Typography>
        )}

        {!isMobileDevice && (
          <Tooltip title={t('Zeige Laufwege als Linien zwischen Team-Standorten')}>
            <FormGroup>
              <FormControlLabel
                control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamPaths(evt.target.checked)} checked={showTeamPaths} size="small" />}
                label={t('admin:hostlocations_team_connections_enable')}
              />
            </FormGroup>
          </Tooltip>
        )}

        {numberOfClusters > 1 && (
          <Box sx={{ ml: 2 }}>
            <Tooltip title={t('Markiere Teams die sich im gleichen Geo-Cluster befinden mit gleicher Farbe')}>
              <FormGroup>
                <FormControlLabel
                  control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamClusters(evt.target.checked)} checked={showTeamClusters} size="small" />}
                  label={t('admin:hostlocations_team_cluster_view_enable')}
                />
              </FormGroup>
            </Tooltip>
          </Box>
        )}

        <RouteOptimizationButton sx={!isMobileDevice ? { mx: 2 } : {}} />

        <UnresolvedGeocodesNotificationButton teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} />

        {isMobileDevice && (
          <IconButton color="inherit" onClick={() => {}} aria-label="Sicht-Einstellungen" size="large">
            <GridViewIcon />
          </IconButton>
        )}

        <HelpButton />

        {isMobileDevice && (
          <IconButton color="inherit" onClick={() => {}} aria-label="Feedback" size="large" sx={{ paddingRight: 0, ml: 1 }}>
            <FeedbackIcon />
          </IconButton>
        )}
      </Toolbar>
    </CustomAppBar>
  );
}
