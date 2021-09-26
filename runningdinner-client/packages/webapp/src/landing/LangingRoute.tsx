import {Redirect, Route, RouteProps, Switch} from "react-router-dom";
import React from "react";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet-async";
import Impressum from "./Impressum";
import {LandingWizard} from "./LandingWizard";
import {LandingStart} from "./LandingStart";
import {PublicDinnerEventsPage} from "./PublicDinnerEventsPage";
import {PublicDinnerEventRegistrationPage} from "./PublicDinnerEventRegistrationPage";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "../common/mainnavigation/NavigationPaths";

export function LandingRoute({path}: RouteProps) {

  const {t} = useTranslation(["landing", "common"]);

  function renderBrowserTitle(titleI18nKey: string) {
    return (
      <Helmet>
        <title>{t(titleI18nKey)}</title>
      </Helmet>
    );
  }

  return (
    <Switch>
      <Route path={`/running-dinner-veranstalten-teilnehmen`}>
        <LandingStart />
        {renderBrowserTitle("landing:start_title")}
      </Route>
      <Route path={`/news`}>
        News
        {renderBrowserTitle("common:news")}
      </Route>
      <Route path={LANDING_CREATE_RUNNING_DINNER_PATH}>
        <LandingWizard />
        {renderBrowserTitle("landing:create_wizard_title")}
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId/registration`}>
        <PublicDinnerEventRegistrationPage />
        {renderBrowserTitle("common:registration")}
      </Route>
      <Route path={`${RUNNING_DINNER_EVENTS_PATH}/:publicDinnerId`}>
        <PublicDinnerEventRegistrationPage />
        {renderBrowserTitle("landing:public_dinner_events_headline")}
      </Route>
      <Route path={RUNNING_DINNER_EVENTS_PATH}>
        <PublicDinnerEventsPage />
        {renderBrowserTitle("landing:public_dinner_events_headline")}
      </Route>
      <Route path="/impressum">
        <Impressum />
        {renderBrowserTitle("landing:impressum_title")}
      </Route>
      <Route path="/">
        <Redirect to="/running-dinner-veranstalten-teilnehmen"/>
      </Route>
    </Switch>
  );
}