import React from 'react';
import {ProgressBar} from "../common/ProgressBar";
import {Container} from "@material-ui/core";
import {useRouteMatch} from "react-router-dom";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";
import {LandingRoute} from "./LangingRoute";
import {useTranslation} from "react-i18next";


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
      routePath: "/running-dinner-events",
      title: "Running Dinner Events"
    }, {
      routePath: "/create-running-dinner",
      title: t("common:create_running_dinner")
    }, {
      routePath: "/impressum",
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