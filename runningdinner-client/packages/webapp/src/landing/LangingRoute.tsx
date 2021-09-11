import {Redirect, Route, RouteProps, Switch} from "react-router-dom";
import React from "react";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet-async";
import Impressum from "./Impressum";
import {LandingWizard} from "./LandingWizard";
import {LandingStart} from "./LandingStart";
import {PublicDinnerEventsPage} from "./PublicDinnerEventsPage";

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
      <Route path={`/create-running-dinner`}>
        <LandingWizard />
        {renderBrowserTitle("landing:create_wizard_title")}
      </Route>
      <Route path={`/running-dinner-events`}>
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