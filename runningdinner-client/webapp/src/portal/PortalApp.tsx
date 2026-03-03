import { Route, Routes } from 'react-router-dom';

import { LandingMainNavigation } from '../common/theme/LandingMainNavigation';
import { MyEventsPage } from './MyEventsPage';
import { PortalActivationPage } from './PortalActivationPage';

export default function PortalApp() {
  return (
    <div>
      <LandingMainNavigation />
      <Routes>
        {/* Combined confirmation+portal link: /my-events/:portalToken[?confirmPublicDinnerId=...&confirmParticipantId=...] */}
        <Route path=":portalToken" element={<PortalActivationPage />} />
        {/* Portal landing page: /my-events */}
        <Route index element={<MyEventsPage />} />
      </Routes>
    </div>
  );
}
