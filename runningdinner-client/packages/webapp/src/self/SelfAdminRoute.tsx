import {Route, RouteProps, Switch} from "react-router-dom";
import React from "react";
import { SelfAdminChangeTeamHostPage } from "./SelfAdminChangeTeamHostPage";
import {SelfAdminPageContainer} from "./SelfAdminPageContainer";
import SelfAdminDinnerRoutePage from "./SelfAdminDinnerRoutePage";

export function SelfAdminRoute({path}: RouteProps) {

  return (
    <Switch>
      <Route path={`${path}/teamhost/:participantId/:teamId`}>
        <SelfAdminPageContainer>
          <SelfAdminChangeTeamHostPage />
        </SelfAdminPageContainer>
      </Route>
      <Route path={`${path}/dinnerroute/:participantId/:teamId`}>
        <SelfAdminPageContainer>
          <SelfAdminDinnerRoutePage />
        </SelfAdminPageContainer>
      </Route>
      <Route path={`${path}/teampartnerwish/:participantId`}>
        {/*<SelfTeamPartnerWishPage adminId={selfAdminId} />*/}
      </Route>
      <Route path="/">
        <p>TODO Error view</p>
      </Route>
    </Switch>
  );
}
