import React from 'react';
import {useMediaQuery} from "@mui/material";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";
import {LandingRoute} from "./LangingRoute";
import {useTranslation} from "react-i18next";
import {
  IMPRESSUM_PATH,
  LANDING_CREATE_RUNNING_DINNER_PATH, LANDING_NEWS_PATH, LANDING_START_PATH,
  RUNNING_DINNER_EVENTS_PATH
} from "../common/mainnavigation/NavigationPaths";


export default function LandingApp() {

  const {t} = useTranslation(["landing", "common"]);

  const showMainTitle = useMediaQuery('(min-width:1090px)');
  const mainTitle = showMainTitle ? "Run Your Dinner" : undefined;

  const navigationItems = [
    {
      routePath: LANDING_START_PATH,
      title: "Start"
    }, {
      routePath: LANDING_NEWS_PATH,
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
      <MainNavigation mainTitle={mainTitle}
                      navigationItems={navigationItems} />
      <LandingRoute />
    </div>
  );

}