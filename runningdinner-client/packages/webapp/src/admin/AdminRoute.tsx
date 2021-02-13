import React from 'react';
import {ParticipantMessages, TeamMessages} from "./messages/MessagesContainer";
import ParticipantsContainer from "./participants/ParticipantsContainer";
import TeamsContainer from "./teams/TeamsContainer";
import Dashboard from "./dashboard/Dashboard";
import {Route, Switch} from "react-router-dom";
import {useAdminContext} from "./AdminContext";

export interface AdminRouteProps {
  path: string;
}

export const AdminRoute = ({path}: AdminRouteProps) => {

  const {runningDinner} = useAdminContext();
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

        <Route path={`${path}/teams/messages`}>
          <TeamMessages adminId={adminId} />
        </Route>
        <Route path={`${path}/teams/:teamId`}>
          <TeamsContainer />
        </Route>
        <Route path={`${path}/teams`}>
          <TeamsContainer />
        </Route>
        <Route path="/">
          <Dashboard runningDinner={runningDinner} />
        </Route>
      </Switch>
  );
};
