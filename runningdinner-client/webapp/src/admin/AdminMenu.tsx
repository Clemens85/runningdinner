import { useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { MainNavigation } from '../common/mainnavigation/MainNavigation';
import { useIsDeviceMinWidth } from '../common/theme/CustomMediaQueryHook';
import AdminNotificationBar from './common/AdminNotificationBar';

export default function AdminMenu() {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  let showHomeLink = true;
  const min1024Device = useIsDeviceMinWidth(1024);
  const min1250Device = useIsDeviceMinWidth(1250);
  const isBigTabletDevice = min1024Device && !min1250Device;
  if (isBigTabletDevice) {
    showHomeLink = false;
  }
  const donatePaddingRight = isMobileDevice || isBigTabletDevice ? 3 : 12;

  const { t } = useTranslation(['admin', 'common']);
  const { adminId } = useParams<{ adminId: string }>();

  const showMainTitle = useMediaQuery('(min-width:1024px)');
  const mainTitle = showMainTitle ? 'Run Your Dinner Administration' : undefined;

  const navigationItems = [
    {
      routePath: `/admin/${adminId}/dashboard`,
      title: t('admin:dashboard'),
    },
    {
      routePath: `/admin/${adminId}/participants`,
      title: t('common:participants'),
    },
    {
      routePath: `/admin/${adminId}/teams`,
      title: 'Teams',
    },
    {
      routePath: `/admin/${adminId}/messages/overview`,
      title: t('common:messages'),
    },
    {
      routePath: `/admin/${adminId}/settings`,
      title: t('common:settings'),
    },
  ];

  return (
    <>
      <AdminNotificationBar />
      <MainNavigation mainTitle={mainTitle} showHomeLink={showHomeLink} isMobileDevice={isMobileDevice} donatePaddingRight={donatePaddingRight} navigationItems={navigationItems} />
    </>
  );
}
