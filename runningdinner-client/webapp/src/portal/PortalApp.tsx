import { Container } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import { LandingMainNavigation } from '../common/theme/LandingMainNavigation';
import { MyEventsPage } from './MyEventsPage';
import { PortalActivationPage } from './PortalActivationPage';
import { ParticipantSelfServicePage } from './selfservice/ParticipantSelfServicePage.tsx';

export default function PortalApp() {
  return (
    <div>
      <LandingMainNavigation />
      <Routes>
        {/* Combined confirmation+portal link: /my-events/:portalToken[?confirmPublicDinnerId=...&confirmParticipantId=...] */}
        <Route path=":portalToken" element={<PortalActivationPage />} />
        {/* Participant event detail: /my-events/event/:selfAdminId/:participantId */}
        <Route
          path="event/:selfAdminId/:participantId"
          element={
            <Container maxWidth={false} sx={{ py: 4 }}>
              <Container maxWidth="lg">
                <ParticipantSelfServicePage />
              </Container>
            </Container>
          }
        />
        {/* Portal landing page: /my-events */}
        <Route index element={<MyEventsPage />} />
      </Routes>
    </div>
  );
}
