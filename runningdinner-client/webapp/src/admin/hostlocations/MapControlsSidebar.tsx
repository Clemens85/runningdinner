import { Box, Divider, Drawer, IconButton, Stack, styled, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { DinnerRouteMapData, DinnerRouteOverviewActionType, useDinnerRouteOverviewContext } from '@runningdinner/shared';
import { BaseAdminIdProps } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { TeamLocationsFilterList } from './TeamLocationsFilterList';
import { RouteDistancesView } from './RouteDistancesView';
import { NearbyHostsAnalysis } from './NearbyHostsAnalysis';
import { ResetAllButton } from './ResetAllButton';

export const SIDEBAR_WIDTH = 540;

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
} & BaseAdminIdProps;

export function MapControlsSidebar({ open, adminId, dinnerRouteMapData }: MapControlSidebarProps) {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useIsMobileDevice();
  const sidebarWidth = isMobile ? '100%' : SIDEBAR_WIDTH;

  const { dinnerRouteMapEntries } = dinnerRouteMapData;

  const { dispatch } = useDinnerRouteOverviewContext();

  const toggleSidebar = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_SIDEBAR,
    });
  };

  const { t } = useTranslation();

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
          ...(isMobile ? { height: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16 } : { top: '64px', height: 'calc(100% - 64px)' }),
        },
      }}
    >
      <DrawerHeader>
        <Stack direction={'row'} justifyContent="space-between" sx={{ width: '100%' }}>
          <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'}>
            <IconButton onClick={toggleSidebar} size="small" color="inherit">
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ ml: 1 }}>OPTIONEN & AKTIONEN</Typography>
          </Stack>
          <Box sx={{ textAlign: 'right', ml: 2 }}>
            <ResetAllButton />
          </Box>
        </Stack>
      </DrawerHeader>
      <Divider />

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        aria-label="map control options"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('Teams')} id="tab-0" />
        <Tab label={t('Entfernungen')} id="tab-1" />
        <Tab label={t('Erweitert')} id="tab-2" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <TeamLocationsFilterList dinnerRouteMapEntries={dinnerRouteMapEntries} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <RouteDistancesView adminId={adminId} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <NearbyHostsAnalysis adminId={adminId} />
      </TabPanel>
    </Drawer>
  );
}
