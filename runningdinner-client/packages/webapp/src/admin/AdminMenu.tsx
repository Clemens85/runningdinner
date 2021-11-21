import React from 'react';
import {
  useMediaQuery
} from "@material-ui/core";
import {useRouteMatch} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";

export default function AdminMenu() {

  const {t} = useTranslation(["admin", "common"]);
  const {url} = useRouteMatch();

  const showMainTitle = useMediaQuery('(min-width:1024px)');
  const mainTitle = showMainTitle ? "Run Your Dinner Administration" : undefined;

  const navigationItems = [
    {
      routePath: "",
      title: t("admin:dashboard")
    }, {
      routePath: "/participants",
      title: t("common:participants")
    }, {
      routePath: "/teams",
      title: "Teams"
    }, {
      routePath: "/settings",
      title: t("common:settings")
    }
  ];

  return (
    <MainNavigation
      mainTitle={mainTitle}
      baseUrl={url}
      mobileBreakpoint={"xs"}
      navigationItems={navigationItems} />
  );

}