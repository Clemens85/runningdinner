import {Route, RouteProps, Switch} from "react-router-dom";
import React, { Suspense } from "react";
import {SelfAdminPageContainer} from "./SelfAdminPageContainer";
import {ProgressBar} from "../common/ProgressBar";
const SelfAdminChangeTeamHostPage = React.lazy(() => import('./SelfAdminChangeTeamHostPage'));
const SelfAdminDinnerRoutePage = React.lazy(() => import('./SelfAdminDinnerRoutePage'));
const SelfAdminManageTeamPartnerWishPage = React.lazy(() => import('./SelfAdminManageTeamPartnerWishPage'));


export function SelfAdminRoute({path}: RouteProps) {

  return (
    <Switch>
      <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
        <Route path={`${path}/teamhost/:participantId/:teamId`}>
          <SelfAdminPageContainer htmlPageTitleI18n="host_manage_title">
            <SelfAdminChangeTeamHostPage />
          </SelfAdminPageContainer>
        </Route>
        <Route path={`${path}/dinnerroute/:participantId/:teamId`}>
          <SelfAdminPageContainer htmlPageTitleI18n="dinnerroute_title">
            <SelfAdminDinnerRoutePage />
          </SelfAdminPageContainer>
        </Route>
        <Route path={`${path}/teampartnerwish/:participantId`}>
          <SelfAdminPageContainer htmlPageTitleI18n="team_partner_wish_manage_title">
            <SelfAdminManageTeamPartnerWishPage />
          </SelfAdminPageContainer>
        </Route>
        <Route path="/">
          <p>TODO Error view</p>
        </Route>
      </Suspense>
    </Switch>
  );
}
