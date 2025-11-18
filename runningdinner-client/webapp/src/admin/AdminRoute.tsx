import { getRunningDinnerFetchSelector, useAdminSelector } from '@runningdinner/shared';
import { Route, Routes } from 'react-router-dom';

import { BrowserTitle } from '../common/mainnavigation/BrowserTitle';
import Acknowledge from './common/Acknowledge';
import Dashboard from './dashboard/Dashboard';
import { HostLocationsPage } from './hostlocations';
import { MessagesLandingPage } from './messages/landing';
import { MessageJobDetailsList } from './messages/messagejobs/MessageJobDetailsList';
import { DinnerRouteMessages, ParticipantMessages, TeamMessages } from './messages/MessagesContainer';
import { ParticipantsPage } from './participants/ParticipantsPage';
import { PaymentOptionsPage } from './paymentoptions/PaymentOptionsPage';
import { SettingsPage } from './settings/SettingsPage';
import { SupportPage } from './support/SupportPage.tsx';
import TeamDinnerRoute from './teams/TeamDinnerRoute';
import TeamsContainer from './teams/TeamsContainer';

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

      <Route path={`participants`} element={<ParticipantsPage runningDinner={runningDinner} />} />

      <Route path={`dinnerroute/messages`} element={<DinnerRouteMessages runningDinner={runningDinner} />} />

      <Route path={`teams/messages`} element={<TeamMessages runningDinner={runningDinner} />} />

      <Route path={`teams/:teamId/dinnerroute`} element={<TeamDinnerRoute />} />

      <Route path={`teams/:teamId`} element={<TeamsContainer />} />

      <Route path={`teams`} element={<TeamsContainer />} />

      <Route path={`hostlocations`} element={<HostLocationsPage runningDinner={runningDinner} />} />

      <Route path={`:acknowledgeId/acknowledge`} element={<Acknowledge runningDinner={runningDinner} />} />

      <Route path={`mailprotocols/:messageJobId`} element={<MessageJobDetailsList runningDinner={runningDinner} />} />

      <Route
        path={`settings`}
        element={
          <>
            <SettingsPage runningDinner={runningDinner} />
            <BrowserTitle namespaces={'common'} titleI18nKey={'common:settings'} />
          </>
        }
      />

      <Route path={'messages/overview'} element={<MessagesLandingPage runningDinner={runningDinner} />} />

      <Route path={`paymentoptions`} element={<PaymentOptionsPage runningDinner={runningDinner} />} />

      <Route path={`support-functions`} element={<SupportPage runningDinner={runningDinner} />} />

      <Route path={'*'} element={<Dashboard runningDinner={runningDinner} />} />
    </Routes>
  );
}
