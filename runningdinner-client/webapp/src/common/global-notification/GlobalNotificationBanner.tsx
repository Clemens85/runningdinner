import { Trans } from "react-i18next";
import AlertCentered from "../theme/AlertCentered";
import { AlertColor } from "@mui/material";
import { GLOBAL_NOTIFICATION_BANNER_ENABLED, GlobalNotificationBannerApp } from "./GlobalNotificationBannerSettings";
import { useLocation } from "react-router-dom";


type GlobalNotificationBannerProps = {
  app: GlobalNotificationBannerApp;
};

export function GlobalNotificationBanner({app}: GlobalNotificationBannerProps) {

  const location = useLocation();
  
  if (!GLOBAL_NOTIFICATION_BANNER_ENABLED) {
    return null;
  }

  const currentUrl = location.pathname;
  const showLandingMsg = currentUrl.includes("running-dinner-events") && app === GlobalNotificationBannerApp.LANDING;

  if (app === GlobalNotificationBannerApp.LANDING && !showLandingMsg) {
    return null;
  }

  const severity: AlertColor = "info";
  // if (app === GlobalNotificationBannerApp.ADMIN || app === GlobalNotificationBannerApp.WIZARD) {
  //   severity = "warning";
  // }

  return (
    <AlertCentered severity={severity} icon={false}>
      <strong><Trans i18nKey={"common:attention"} /></strong>{' '}
      <Trans i18nKey={"common:global_banner_alert_generic_msg"} />{' '}
      { app === GlobalNotificationBannerApp.WIZARD && <><br/><Trans i18nKey={"common:global_banner_alert_wizard_msg"} /></> }
      { app === GlobalNotificationBannerApp.ADMIN && <><br/><Trans i18nKey={"common:global_banner_alert_admin_msg"} /></> }
      { showLandingMsg && <><br/>{<Trans i18nKey={"common:global_banner_alert_landing_msg"} />}</>}
    </AlertCentered>
  )
}