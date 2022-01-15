import {Redirect, Route, Switch} from "react-router-dom";
import React from "react";
import Impressum from "./Impressum";
import {LandingWizard} from "./LandingWizard";
import {LandingStart} from "./LandingStart";
import {PublicDinnerEventsPage} from "./PublicDinnerEventsPage";
import {PublicDinnerEventRegistrationPage} from "./PublicDinnerEventRegistrationPage";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "../common/mainnavigation/NavigationPaths";
import { PublicDinnerEventRegistrationFinishedPage } from "./PublicDinnerEventRegistrationFinishedPage";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";
import {NewsPage} from "./news/NewsPage";
import {ParticipantActivationPage} from "./ParticipantActivationPage";
import { Container } from "@material-ui/core";
import { LandingBanner } from "./LandingBanner";

export function LandingRoute() {

  return (
    <Switch>
      <Route path={`/running-dinner-veranstalten-teilnehmen`}>
        <LandingBanner />
        <LandingStart />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:start_title"} />
      </Route>
      <Route path={`/news`}>
        <Container maxWidth="xl">
          <NewsPage />
          <BrowserTitle namespaces={"common"} titleI18nKey={"common:news"} />
        </Container>
      </Route>
      <Route path={LANDING_CREATE_RUNNING_DINNER_PATH}>
        <Container maxWidth="xl">
          <LandingWizard />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:create_wizard_title"} />
         </Container>
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/:participantId/activate`}>
        <Container maxWidth="xl">
          <ParticipantActivationPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_confirm_title"} />
        </Container>
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration-finished`}>
        <Container maxWidth="xl">
          <PublicDinnerEventRegistrationFinishedPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_finished_title"} />
        </Container>
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId`}>
        <Container maxWidth="xl">
          <PublicDinnerEventRegistrationPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration"} />
        </Container>
      </Route>
      <Route path={RUNNING_DINNER_EVENTS_PATH}>
        <Container maxWidth="xl"> 
          <PublicDinnerEventsPage />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:public_dinner_events_headline"} />
        </Container>
      </Route>
      <Route path="/impressum">
        <Container maxWidth="xl">
          <Impressum />
          <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:impressum_title"} />
        </Container>
      </Route>
      <Route path="/">
        <Redirect to="/running-dinner-veranstalten-teilnehmen"/>
      </Route>
    </Switch>
  );
}