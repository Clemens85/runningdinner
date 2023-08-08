import React from 'react';
import {
  useMediaQuery
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {MainNavigation} from "../common/mainnavigation/MainNavigation";
import AdminNotificationBar from './common/AdminNotificationBar';

export default function AdminMenu() {

  const {t} = useTranslation(["admin", "common"]);

  const showMainTitle = useMediaQuery('(min-width:1024px)');
  const mainTitle = showMainTitle ? "Run Your Dinner Administration" : undefined;

  const navigationItems = [
    {
      routePath: "dashboard",
      title: t("admin:dashboard")
    }, {
      routePath: "participants",
      title: t("common:participants")
    }, {
      routePath: "teams",
      title: "Teams"
    }, {
      routePath: "settings",
      title: t("common:settings")
    }
  ];

  return (
    <>
    <AdminNotificationBar />
    <MainNavigation
      mainTitle={mainTitle}
      mobileBreakpoint={"xs"}
      navigationItems={navigationItems} />
    </>
  );

}