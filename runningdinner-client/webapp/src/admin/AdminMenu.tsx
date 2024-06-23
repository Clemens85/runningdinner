import {
  useMediaQuery,
  useTheme
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";
import AdminNotificationBar from './common/AdminNotificationBar';
import { useIsDeviceMinWidth } from "../common/theme/CustomMediaQueryHook";

export default function AdminMenu() {


  const theme = useTheme();
  let isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  let showHomeLink = true;
  const min1024Device = useIsDeviceMinWidth(1024);
  const min1250Device = useIsDeviceMinWidth(1250);
  const isBigTabletDevice = min1024Device && !min1250Device;
  if (isBigTabletDevice) {
    showHomeLink = false;
  }
  const donatePaddingRight = isMobileDevice || isBigTabletDevice ? 3 : 12;

  const {t} = useTranslation(["admin", "common"]);

  const showMainTitle = useMediaQuery('(min-width:1024px)');
  const mainTitle = showMainTitle ? "Run Your Dinner Administration" : undefined;

  const navigationItems = [
    {
      routePath: "dashboard",
      title: t("admin:dashboard")
    }, {
      routePath: "participants",
      title: t("common:participants")
    }, {
      routePath: "teams",
      title: 'Teams'
    }, {
      routePath: "messages/overview",
      title: t("common:messages")
    }, {
      routePath: "settings",
      title: t("common:settings")
    }
  ];

  return (
    <>
    <AdminNotificationBar />
    <MainNavigation
      mainTitle={mainTitle}
      showHomeLink={showHomeLink}
      isMobileDevice={isMobileDevice}
      donatePaddingRight={donatePaddingRight}
      navigationItems={navigationItems} />
    </>
  );

}