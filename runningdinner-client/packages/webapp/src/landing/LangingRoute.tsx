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

export function LandingRoute() {

  return (
    <Switch>
      <Route path={`/running-dinner-veranstalten-teilnehmen`}>
        <LandingStart />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:start_title"} />
      </Route>
      <Route path={`/news`}>
        <NewsPage />
        <BrowserTitle namespaces={"common"} titleI18nKey={"common:news"} />
      </Route>
      <Route path={LANDING_CREATE_RUNNING_DINNER_PATH}>
        <LandingWizard />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:create_wizard_title"} />
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/:participantId/activate`}>
        <ParticipantActivationPage />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_confirm_title"} />
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration-finished`}>
        <PublicDinnerEventRegistrationFinishedPage />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration_finished_title"} />
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId`}>
        <PublicDinnerEventRegistrationPage />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:registration"} />
      </Route>
      <Route path={RUNNING_DINNER_EVENTS_PATH}>
        <PublicDinnerEventsPage />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:public_dinner_events_headline"} />
      </Route>
      <Route path="/impressum">
        <Impressum />
        <BrowserTitle namespaces={"landing"} titleI18nKey={"landing:impressum_title"} />
      </Route>
      <Route path="/">
        <Redirect to="/running-dinner-veranstalten-teilnehmen"/>
      </Route>
    </Switch>
  );
}