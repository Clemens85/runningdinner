import React from 'react';
import {DinnerRouteMessages, ParticipantMessages, TeamMessages} from "./messages/MessagesContainer";
import ParticipantsPage from "./participants/ParticipantsPage";
import TeamsContainer from "./teams/TeamsContainer";
import Dashboard from "./dashboard/Dashboard";
import {Route, Routes} from "react-router-dom";
import {getRunningDinnerFetchSelector, useAdminSelector} from "@runningdinner/shared";
import Acknowledge from "./common/Acknowledge";
import TeamDinnerRoute from "./teams/TeamDinnerRoute";
import {MessageJobDetailsList} from "./messages/messagejobs/MessageJobDetailsList";
import {SettingsPage} from "./settings/SettingsPage";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";
import {PaymentOptionsPage} from "./paymentoptions/PaymentOptionsPage";
import { ParticipantsPageNew } from './participants/ParticipantsPageNew';

export default function AdminRoute() {

  const runningDinnerFetchData = useAdminSelector(getRunningDinnerFetchSelector);
  if (!runningDinnerFetchData.data) {
    return null;
  }

  const runningDinner = runningDinnerFetchData.data;

  return (
      <Routes>
        <Route path={`participants/messages`} element={<ParticipantMessages runningDinner={runningDinner} />} />

        <Route path={`participants/:participantId`} element={<ParticipantsPage runningDinner={runningDinner} />} />

        <Route path={`participants`} element={<ParticipantsPageNew runningDinner={runningDinner} />} />

        <Route path={`dinnerroute/messages`} element={<DinnerRouteMessages runningDinner={runningDinner} />} />

        <Route path={`teams/messages`} element={<TeamMessages runningDinner={runningDinner} />} />

        <Route path={`teams/:teamId/dinnerroute`} element={<TeamDinnerRoute />} />

        <Route path={`teams/:teamId`} element={<TeamsContainer />} />

        <Route path={`teams`} element={<TeamsContainer />} />

        <Route path={`:acknowledgeId/acknowledge`} element={<Acknowledge runningDinner={runningDinner} />} />

        <Route path={`mailprotocols/:messageJobId`} element={<MessageJobDetailsList runningDinner={runningDinner} />} />

        <Route path={`settings`} element={
          <>
            <SettingsPage runningDinner={runningDinner} />
            <BrowserTitle  namespaces={"common"} titleI18nKey={"common:settings"} />
          </>
        } />

        <Route path={`paymentoptions`} element={<PaymentOptionsPage runningDinner={runningDinner} />} />

        <Route path={"*"} element={<Dashboard runningDinner={runningDinner} />} />
      </Routes>
  );
}
