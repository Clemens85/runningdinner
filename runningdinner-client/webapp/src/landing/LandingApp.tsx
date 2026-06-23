import { GlobalNotificationBanner, GlobalNotificationBannerApp } from '../common/global-notification';
import { TeaserPopup } from '../common/teaserpopup';
import { LandingMainNavigation } from '../common/theme/LandingMainNavigation';
import { LandingRoute } from './LangingRoute';

export default function LandingApp() {
  return (
    <div>
      <GlobalNotificationBanner app={GlobalNotificationBannerApp.LANDING} />
      <LandingMainNavigation />
      <LandingRoute />
      <TeaserPopup />
    </div>
  );
}
