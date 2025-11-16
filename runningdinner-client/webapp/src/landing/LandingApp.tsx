import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { GlobalNotificationBanner, GlobalNotificationBannerApp } from '../common/global-notification';
import { MainNavigation } from '../common/mainnavigation/MainNavigation';
import { IMPRESSUM_PATH, LANDING_CREATE_RUNNING_DINNER_PATH, LANDING_NEWS_PATH, LANDING_START_PATH, RUNNING_DINNER_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import { TeaserPopup } from '../common/teaserpopup';
import { useIsDeviceMinWidth } from '../common/theme/CustomMediaQueryHook';
import { LandingRoute } from './LangingRoute';

export default function LandingApp() {
  const { t } = useTranslation(['landing', 'common']);

  const showMainTitle = useMediaQuery('(min-width:1090px)');
  const mainTitle = showMainTitle ? 'Run Your Dinner' : undefined;

  const isMobileDevice = !useIsDeviceMinWidth(1280);
  const isLgDevice = useIsDeviceMinWidth(1333);
  const isXlDevice = useIsDeviceMinWidth(1380);
  let donateBtnPaddingRight = 12;
  if (!isXlDevice) {
    if (isLgDevice) {
      donateBtnPaddingRight = 1;
    } else {
      donateBtnPaddingRight = 3;
    }
  }
  const showHomeLink = isLgDevice;

  console.log('showHomeLink: ' + showHomeLink);
  console.log('isMobileDevice: ' + isMobileDevice);

  const navigationItems = [
    {
      routePath: LANDING_START_PATH,
      title: 'Start',
    },
    {
      routePath: LANDING_NEWS_PATH,
      title: t('common:news'),
    },
    {
      routePath: RUNNING_DINNER_EVENTS_PATH,
      title: 'Running Dinner Events',
    },
    {
      routePath: LANDING_CREATE_RUNNING_DINNER_PATH,
      title: t('common:create_running_dinner'),
    },
    {
      routePath: IMPRESSUM_PATH,
      title: t('common:imprint'),
    },
  ];

  return (
    <div>
      <GlobalNotificationBanner app={GlobalNotificationBannerApp.LANDING} />
      <MainNavigation
        mainTitle={mainTitle}
        showHomeLink={showHomeLink}
        isMobileDevice={isMobileDevice}
        donatePaddingRight={donateBtnPaddingRight}
        navigationItems={navigationItems}
      />
      <LandingRoute />
      <TeaserPopup />
    </div>
  );
}
