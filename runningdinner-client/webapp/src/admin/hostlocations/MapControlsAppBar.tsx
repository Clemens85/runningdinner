import FeedbackIcon from '@mui/icons-material/Feedback';
import GridViewIcon from '@mui/icons-material/GridView';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, FormControlLabel, FormGroup, IconButton, Popover,styled, Switch, Toolbar, Tooltip, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { CallbackHandler, DinnerRouteOverviewActionType, useDinnerRouteOverviewContext, useDisclosure } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UnresolvedGeocodesWarningAlertProps } from '../../common/dinnerroute';
import { FeedbackDialog } from '../../common/feedback/FeedbackDialog';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { HelpButton } from './HelpButton';
import { RouteOptimizationButton } from './RouteOptimizationButton';
import { UnresolvedGeocodesNotificationButton } from './UnresolvedGeocodesNotificationButton';

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
  const { isSidebarOpen } = state;
  const isMobileDevice = useIsMobileDevice();

  const { t } = useTranslation('admin');

  const [popoverViewSettingsElement, setPopoverViewSettingsElement] = useState<HTMLElement | null>(null);

  const toggleSidebar = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SIDEBAR,
    });
  };

  const viewLabel = t('admin:hostlocations_view_settings');

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

        {!isMobileDevice && <ShowTeamConnectionPathsSwitch />}

        {numberOfClusters > 1 && !isMobileDevice && (
          <Box sx={{ ml: 2 }}>
            <ShowTeamClustersSwitch />
          </Box>
        )}

        <RouteOptimizationButton sx={!isMobileDevice ? { mx: 2 } : {}} />

        <UnresolvedGeocodesNotificationButton teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} />

        {isMobileDevice && (
          <>
            <IconButton
              color="inherit"
              onClick={(evt: React.MouseEvent<HTMLButtonElement>) => setPopoverViewSettingsElement(evt.currentTarget)}
              aria-label={viewLabel}
              size="large"
            >
              <GridViewIcon />
            </IconButton>
            {popoverViewSettingsElement && (
              <ViewSettingsPopover onClose={() => setPopoverViewSettingsElement(null)} popoverElement={popoverViewSettingsElement} numberOfClusters={numberOfClusters} />
            )}
          </>
        )}

        <HelpButton />

        <FeedbackButton />
      </Toolbar>
    </CustomAppBar>
  );
}

function FeedbackButton() {
  const { isOpen, close, open } = useDisclosure();
  const { t } = useTranslation('common');
  const label = t('common:feedback_label');
  return (
    <>
      <Tooltip title={label}>
        <IconButton color="inherit" onClick={open} aria-label={label} size="large" sx={{ paddingRight: 0, ml: 1 }}>
          <FeedbackIcon />
        </IconButton>
      </Tooltip>
      {isOpen && <FeedbackDialog onClose={close} />}
    </>
  );
}

function ShowTeamConnectionPathsSwitch() {
  const { state, dispatch } = useDinnerRouteOverviewContext();
  const { showTeamPaths } = state;

  const { t } = useTranslation('admin');

  function onToggleShowTeamPaths(showTeamPaths: boolean) {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_PATHS,
      payload: showTeamPaths,
    });
  }

  return (
    <Tooltip title={t('admin:hostlocations_team_connections_view_help')}>
      <FormGroup>
        <FormControlLabel
          control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamPaths(evt.target.checked)} checked={showTeamPaths} size="small" />}
          label={t('admin:hostlocations_team_connections_enable')}
        />
      </FormGroup>
    </Tooltip>
  );
}

function ShowTeamClustersSwitch() {
  const { state, dispatch } = useDinnerRouteOverviewContext();
  const { showTeamClusters } = state;

  const { t } = useTranslation('admin');

  function onToggleShowTeamClusters(showTeamClusters: boolean) {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SHOW_TEAM_CLUSTERS,
      payload: showTeamClusters,
    });
  }

  return (
    <Tooltip title={t('admin:hostlocations_team_cluster_view_help')}>
      <FormGroup>
        <FormControlLabel
          control={<Switch color="secondary" onChange={(evt) => onToggleShowTeamClusters(evt.target.checked)} checked={showTeamClusters} size="small" />}
          label={t('admin:hostlocations_team_cluster_view_enable')}
        />
      </FormGroup>
    </Tooltip>
  );
}

type ViewSettingsPopoverProps = {
  onClose: CallbackHandler;
  popoverElement: HTMLElement | null;
  numberOfClusters: number;
};
function ViewSettingsPopover({ onClose, popoverElement, numberOfClusters }: ViewSettingsPopoverProps) {
  return (
    <Popover
      open={true}
      anchorEl={popoverElement}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2 }}>
        <ShowTeamConnectionPathsSwitch />
      </Box>
      {numberOfClusters > 1 && (
        <Box sx={{ p: 2 }}>
          <ShowTeamClustersSwitch />
        </Box>
      )}
    </Popover>
  );
}
