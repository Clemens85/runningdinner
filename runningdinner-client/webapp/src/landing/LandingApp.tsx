import { GlobalNotificationBanner, GlobalNotificationBannerApp } from '../common/global-notification';
import { LandingMainNavigation } from '../common/theme/LandingMainNavigation';
import { TeaserPopup } from '../common/teaserpopup';
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
