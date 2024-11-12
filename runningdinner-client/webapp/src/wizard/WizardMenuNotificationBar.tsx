import {useWizardSelector} from "@runningdinner/shared";
import {isDemoDinnerSelector} from "@runningdinner/shared";
import {Trans} from "react-i18next";
import AlertCentered from "../common/theme/AlertCentered";
import { GLOBAL_NOTIFICATION_BANNER_ENABLED, GlobalNotificationBanner } from "../common/global-notification";
import { GlobalNotificationBannerApp } from "../common/global-notification";

export default function WizardMenuNotificationBar() {

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);

  if (GLOBAL_NOTIFICATION_BANNER_ENABLED) {
    return <GlobalNotificationBanner app={GlobalNotificationBannerApp.WIZARD} />;
  }

  if (!isDemoDinner) {
    return null;
  }
  return (
    <>
      <AlertCentered severity={"info"} icon={false}>
        <Trans i18nKey={'wizard_demo_mode_text'} ns={"wizard"}/>
      </AlertCentered>
    </>
  );
}
