import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { MainNavigation } from '../mainnavigation/MainNavigation';
import {
  IMPRESSUM_PATH,
  LANDING_CREATE_RUNNING_DINNER_PATH,
  LANDING_NEWS_PATH,
  LANDING_START_PATH,
  MY_EVENTS_PATH,
  RUNNING_DINNER_EVENTS_PATH,
} from '../mainnavigation/NavigationPaths';
import { useIsDeviceMinWidth } from './CustomMediaQueryHook';

export function LandingMainNavigation() {
  const { t } = useTranslation(['common', 'portal']);

  const showMainTitle = useMediaQuery('(min-width:1090px)');
  const mainTitle = showMainTitle ? 'Run Your Dinner' : undefined;

  const isMobileDevice = !useIsDeviceMinWidth(1280);
  const isLgDevice = useIsDeviceMinWidth(1333);
  const isXlDevice = useIsDeviceMinWidth(1380);
  const showHomeLink = isLgDevice;

  let donatePaddingRight = 12;
  if (!isXlDevice) {
    if (isLgDevice) {
      donatePaddingRight = 1;
    } else {
      donatePaddingRight = 3;
    }
  }

  const navigationItems = [
    {
      routePath: `/${LANDING_START_PATH}`,
      title: 'Start',
    },
    {
      routePath: `/${LANDING_NEWS_PATH}`,
      title: t('common:news'),
    },
    {
      routePath: `/${RUNNING_DINNER_EVENTS_PATH}`,
      title: 'Running Dinner Events',
    },
    {
      routePath: `/${LANDING_CREATE_RUNNING_DINNER_PATH}`,
      title: t('common:create_running_dinner'),
    },
    {
      routePath: MY_EVENTS_PATH,
      title: t('portal:my_events'),
    },
    {
      routePath: `/${IMPRESSUM_PATH}`,
      title: t('common:imprint'),
    },
  ];

  return (
    <MainNavigation
      mainTitle={mainTitle}
      showHomeLink={showHomeLink}
      isMobileDevice={isMobileDevice}
      donatePaddingRight={donatePaddingRight}
      navigationItems={navigationItems}
    />
  );
}
