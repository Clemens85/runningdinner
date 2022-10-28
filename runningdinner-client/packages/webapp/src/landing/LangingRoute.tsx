import {Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import Impressum from "./Impressum";
import {LandingWizard} from "./LandingWizard";
import {LandingStart} from "./LandingStart";
import {PublicDinnerEventsPage} from "./PublicDinnerEventsPage";
import {PublicDinnerEventRegistrationPage} from "./PublicDinnerEventRegistrationPage";
import {
  IMPRESSUM_PATH,
  LANDING_CREATE_RUNNING_DINNER_PATH, LANDING_NEWS_PATH,
  LANDING_START_PATH,
  RUNNING_DINNER_EVENTS_PATH
} from "../common/mainnavigation/NavigationPaths";
import { PublicDinnerEventRegistrationFinishedPage } from "./PublicDinnerEventRegistrationFinishedPage";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";
import {NewsPage} from "./news/NewsPage";
import {ParticipantActivationPage} from "./ParticipantActivationPage";
import {Container} from "@material-ui/core";
import { LandingBanner } from "./LandingBanner";

export function LandingRoute() {

  return (
    <Routes>
      <Route path={LANDING_START_PATH} element={
        <>
          <LandingBanner />
          <LandingStart />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:start_title"} />
        </>
      } />
      <Route path={LANDING_NEWS_PATH} element={
        <Container maxWidth="xl">
          <NewsPage />
          <BrowserTitle namespaces={"common"} titleI18nKey={"common:news"} />
        </Container>
      } />
      <Route path={LANDING_CREATE_RUNNING_DINNER_PATH} element={
        <Container maxWidth="xl">
          <LandingWizard />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:create_wizard_title"} />
        </Container>
      } />
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/:participantId/activate`} element={
        <Container maxWidth="xl">
          <ParticipantActivationPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_confirm_title"} />
        </Container>
      } />
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration-finished`} element={
        <Container maxWidth="xl">
          <PublicDinnerEventRegistrationFinishedPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_finished_title"} />
        </Container>
      } />
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration/*`} element={
        <Container maxWidth="xl">
          <PublicDinnerEventRegistrationPage showRegistrationForm={true} />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_finished_title"} />
        </Container>
      } />
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId`} element={
        <Container maxWidth="xl">
          <PublicDinnerEventRegistrationPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration"} />
        </Container>
      } />
      <Route path={RUNNING_DINNER_EVENTS_PATH} element={
        <Container maxWidth="xl">
          <PublicDinnerEventsPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:public_dinner_events_headline"} />
        </Container>
      } />
      <Route path={IMPRESSUM_PATH} element={
        <Container maxWidth="xl">
          <Impressum />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:impressum_title"} />
        </Container>
      } />
      <Route path={"*"} element={
        <>
          <Navigate to={LANDING_START_PATH} replace />
          {/*<LandingBanner />*/}
          {/*<LandingStart />*/}
          {/*<BrowserTitle namespaces={"landing"} titleI18nKey={"landing:start_title"} />*/}
        </>
      } />
    </Routes>
  );
}