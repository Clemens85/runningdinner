import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Box, Divider, Drawer, IconButton, Stack, styled, Tab, Tabs, Typography } from '@mui/material';
import { DinnerRouteMapData, DinnerRouteOverviewActionType, DinnerRouteWithDistancesList, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { BaseAdminIdProps } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { NearbyHostsAnalysis } from './NearbyHostsAnalysis';
import { ResetAllButton } from './ResetAllButton';
import { RouteDistancesView } from './RouteDistancesView';
import { TeamLocationsFilterList } from './TeamLocationsFilterList';

export const SIDEBAR_WIDTH = 540;

export const TEAMS_TAB_INDEX = 0;
export const DISTANCES_TAB_INDEX = 1;
export const ADVANCED_TAB_INDEX = 2;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} style={{ height: '100%', overflow: 'auto' }} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  // justifyContent: 'flex-start',
  minHeight: '48px ! important',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
}));

type MapControlSidebarProps = {
  open: boolean;
  dinnerRouteMapData: DinnerRouteMapData;
  routeDistancesList?: DinnerRouteWithDistancesList | undefined;
} & BaseAdminIdProps;

export function MapControlsSidebar({ open, adminId, dinnerRouteMapData, routeDistancesList }: MapControlSidebarProps) {
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { activeSideBarTabIndex } = state;

  const isMobile = useIsMobileDevice();
  const sidebarWidth = isMobile ? '100%' : SIDEBAR_WIDTH;

  const { dinnerRouteMapEntries } = dinnerRouteMapData;

  const toggleSidebar = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SIDEBAR,
    });
  };

  const setActiveTab = (newValue: number) => {
    dispatch({
      type: DinnerRouteOverviewActionType.OPEN_SIDEBAR,
      payload: newValue,
    });
  };

  const { t } = useTranslation(['admin', 'common']);

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor={isMobile ? 'bottom' : 'left'}
      open={open}
      sx={{
        width: open ? sidebarWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          // ...(isMobile ? { height: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16 } : { top: '64px', height: 'calc(100% - 64px)' }),
          ...(isMobile ? { height: 'calc(100% - 48px)', borderTopLeftRadius: 16, borderTopRightRadius: 16 } : { top: '64px', height: 'calc(100% - 48px)' }),
        },
      }}
    >
      <DrawerHeader>
        <Stack direction={'row'} justifyContent="space-between" sx={{ width: '100%' }}>
          <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'}>
            <IconButton onClick={toggleSidebar} size="small" color="inherit">
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ ml: 1 }}>{t('admin:hostlocations_sidebar_title')}</Typography>
          </Stack>
          <Box sx={{ textAlign: 'right', ml: 2 }}>
            <ResetAllButton />
          </Box>
        </Stack>
      </DrawerHeader>
      <Divider />

      <Tabs
        value={activeSideBarTabIndex}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        aria-label={t('admin:hostlocations_sidebar_title')}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('admin:headline_teams')} id="tab-0" />
        <Tab label={t('common:distances')} id="tab-1" />
        <Tab label={t('common:advanced')} id="tab-2" />
      </Tabs>

      <TabPanel value={activeSideBarTabIndex} index={TEAMS_TAB_INDEX}>
        <TeamLocationsFilterList dinnerRouteMapEntries={dinnerRouteMapEntries} />
      </TabPanel>

      <TabPanel value={activeSideBarTabIndex} index={DISTANCES_TAB_INDEX}>
        <RouteDistancesView routeDistancesList={routeDistancesList} />
      </TabPanel>

      <TabPanel value={activeSideBarTabIndex} index={ADVANCED_TAB_INDEX}>
        <NearbyHostsAnalysis adminId={adminId} />
      </TabPanel>
    </Drawer>
  );
}
