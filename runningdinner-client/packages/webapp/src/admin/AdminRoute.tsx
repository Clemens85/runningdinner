import React from 'react';
import {DinnerRouteMessages, ParticipantMessages, TeamMessages} from "./messages/MessagesContainer";
import ParticipantsContainer from "./participants/ParticipantsContainer";
import TeamsContainer from "./teams/TeamsContainer";
import Dashboard from "./dashboard/Dashboard";
import {Route, Switch} from "react-router-dom";
import {getRunningDinnerFetchSelector, useAdminSelector} from "@runningdinner/shared";
import Acknowledge from "./common/Acknowledge";
import TeamDinnerRoute from "./teams/TeamDinnerRoute";
import {MessageJobDetailsList} from "./messages/messagejobs/MessageJobDetailsList";
import {SettingsPage} from "./settings/SettingsPage";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";

export interface AdminRouteProps {
  path: string;
}

export default function AdminRoute({path}: AdminRouteProps) {

  const runningDinnerFetchData = useAdminSelector(getRunningDinnerFetchSelector);
  if (!runningDinnerFetchData.data) {
    return null;
  }

  const runningDinner = runningDinnerFetchData.data;
  const {adminId} = runningDinner;

  return (
      <Switch>
        <Route path={`${path}/participants/messages`}>
          <ParticipantMessages adminId={adminId} />
        </Route>
        <Route path={`${path}/participants/:participantId`}>
          <ParticipantsContainer runningDinner={runningDinner} />
        </Route>
        <Route path={`${path}/participants`}>
          <ParticipantsContainer runningDinner={runningDinner} />
        </Route>

        <Route path={`${path}/dinnerroute/messages`}>
          <DinnerRouteMessages adminId={adminId} />
        </Route>
        <Route path={`${path}/teams/messages`}>
          <TeamMessages adminId={adminId} />
        </Route>
        <Route path={`${path}/teams/:teamId/dinnerroute`}>
          <TeamDinnerRoute />
        </Route>
        <Route path={`${path}/teams/:teamId`}>
          <TeamsContainer />
        </Route>
        <Route path={`${path}/teams`}>
          <TeamsContainer />
        </Route>
        <Route path={`${path}/:acknowledgeId/acknowledge`}>
          <Acknowledge runningDinner={runningDinner} />
        </Route>
        <Route path={`${path}/mailprotocols/:messageJobId`}>
          <MessageJobDetailsList runningDinner={runningDinner} />
        </Route>
        <Route path={`${path}/settings`}>
          <SettingsPage />
          <BrowserTitle  namespaces={"common"} titleI18nKey={"common:settings"} />
        </Route>
        <Route path="/">
          <Dashboard runningDinner={runningDinner} />
        </Route>
      </Switch>
  );
}
