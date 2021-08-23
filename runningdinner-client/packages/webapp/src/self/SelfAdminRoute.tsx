import {Route, RouteProps, Switch} from "react-router-dom";
import React from "react";
import { SelfAdminChangeTeamHostPage } from "./SelfAdminChangeTeamHostPage";
import {SelfAdminPageContainer} from "./SelfAdminPageContainer";
import SelfAdminDinnerRoutePage from "./SelfAdminDinnerRoutePage";
import SelfAdminManageTeamPartnerWishPage from "./SelfAdminManageTeamPartnerWishPage";

export function SelfAdminRoute({path}: RouteProps) {

  return (
    <Switch>
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
    </Switch>
  );
}
