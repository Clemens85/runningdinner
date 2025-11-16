import { Container } from '@mui/material';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { BrowserTitle } from '../common/mainnavigation/BrowserTitle';
import { IMPRESSUM_PATH, LANDING_CREATE_RUNNING_DINNER_PATH, LANDING_NEWS_PATH, LANDING_START_PATH, RUNNING_DINNER_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import Impressum from './Impressum';
import { LandingBanner } from './LandingBanner';
import { LandingStart } from './LandingStart';
import { LandingWizard } from './LandingWizard';
import { NewsPage } from './news/NewsPage';
import { ParticipantActivationPage } from './ParticipantActivationPage';
import { PublicDinnerEventRegistrationFinishedPage } from './PublicDinnerEventRegistrationFinishedPage';
import { PublicDinnerEventRegistrationPage } from './PublicDinnerEventRegistrationPage';
import { PublicDinnerEventsPage } from './PublicDinnerEventsPage';

export function LandingRoute() {
  return (
    <Routes>
      <Route
        path={LANDING_START_PATH}
        element={
          <>
            <LandingBanner />
            <LandingStart />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:start_title'} />
          </>
        }
      />
      <Route
        path={LANDING_NEWS_PATH}
        element={
          <Container maxWidth={false}>
            <NewsPage />
            <BrowserTitle namespaces={'common'} titleI18nKey={'common:news'} />
          </Container>
        }
      />
      <Route
        path={LANDING_CREATE_RUNNING_DINNER_PATH}
        element={
          <Container maxWidth={false}>
            <LandingWizard />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:create_wizard_title'} />
          </Container>
        }
      />
      <Route
        path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/:participantId/activate`}
        element={
          <Container maxWidth={false}>
            <ParticipantActivationPage />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:registration_confirm_title'} />
          </Container>
        }
      />
      <Route
        path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration-finished`}
        element={
          <Container maxWidth={false}>
            <PublicDinnerEventRegistrationFinishedPage />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:registration_finished_title'} />
          </Container>
        }
      />
      <Route
        path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration/*`}
        element={
          <Container maxWidth={false}>
            <PublicDinnerEventRegistrationPage showRegistrationForm={true} />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:registration_finished_title'} />
          </Container>
        }
      />
      <Route
        path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId`}
        element={
          <Container maxWidth={false}>
            <PublicDinnerEventRegistrationPage />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:registration'} />
          </Container>
        }
      />
      <Route
        path={RUNNING_DINNER_EVENTS_PATH}
        element={
          <Container maxWidth={false}>
            <PublicDinnerEventsPage />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:public_dinner_events_headline'} />
          </Container>
        }
      />
      <Route
        path={IMPRESSUM_PATH}
        element={
          <Container maxWidth={false}>
            <Impressum />
            <BrowserTitle namespaces={'landing'} titleI18nKey={'landing:impressum_title'} />
          </Container>
        }
      />
      <Route
        path={'*'}
        element={
          <>
            <Navigate to={LANDING_START_PATH} replace />
            {/*<LandingBanner />*/}
            {/*<LandingStart />*/}
            {/*<BrowserTitle namespaces={"landing"} titleI18nKey={"landing:start_title"} />*/}
          </>
        }
      />
    </Routes>
  );
}
