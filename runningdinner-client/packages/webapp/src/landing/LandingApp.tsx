import React from 'react';
import {ProgressBar} from "../common/ProgressBar";
import {Container} from "@material-ui/core";
import {useRouteMatch} from "react-router-dom";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";
import {LandingRoute} from "./LangingRoute";
import {useTranslation} from "react-i18next";
import {
  IMPRESSUM_PATH,
  LANDING_CREATE_RUNNING_DINNER_PATH,
  RUNNING_DINNER_EVENTS_PATH
} from "../common/mainnavigation/NavigationPaths";


export function LandingApp() {

  const {path, url} = useRouteMatch();
  const {t} = useTranslation(["landing", "common"]);

  const navigationItems = [
    {
      routePath: "/running-dinner-veranstalten-teilnehmen",
      title: "Start"
    }, {
      routePath: "/news",
      title: t("common:news")
    }, {
      routePath: RUNNING_DINNER_EVENTS_PATH,
      title: "Running Dinner Events"
    }, {
      routePath: LANDING_CREATE_RUNNING_DINNER_PATH,
      title: t("common:create_running_dinner")
    }, {
      routePath: IMPRESSUM_PATH,
      title: t("common:imprint")
    }
  ];

  return (
    <div>
      <MainNavigation baseUrl={url} mainTitle={"Run Your Dinner"} navigationItems={navigationItems} />
      <ProgressBar showLoadingProgress={false} />
      <Container maxWidth="xl">
        <LandingRoute path={path} />
      </Container>
    </div>
  );

}