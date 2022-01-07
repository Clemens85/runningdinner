import {Route, RouteProps, Switch} from "react-router-dom";
import React, { Suspense } from "react";
import {SelfAdminPageContainer} from "./SelfAdminPageContainer";
import {ProgressBar} from "../common/ProgressBar";
import { Alert } from "@material-ui/lab";
import { Span } from "../common/theme/typography/Tags";
import { Trans } from "react-i18next";
import LinkExtern from "../common/theme/LinkExtern";
import { CONSTANTS } from "@runningdinner/shared";
import { Box } from "@material-ui/core";
const SelfAdminChangeTeamHostPage = React.lazy(() => import('./SelfAdminChangeTeamHostPage'));
const SelfAdminDinnerRoutePage = React.lazy(() => import('./SelfAdminDinnerRoutePage'));
const SelfAdminManageTeamPartnerWishPage = React.lazy(() => import('./SelfAdminManageTeamPartnerWishPage'));


export function SelfAdminRoute({path}: RouteProps) {

  return (
    <Switch>
        <Route path={`${path}/teamhost/:participantId/:teamId`}>
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="host_manage_title">
              <SelfAdminChangeTeamHostPage />
            </SelfAdminPageContainer>
          </Suspense>
        </Route>

        <Route path={`${path}/dinnerroute/:participantId/:teamId`}>
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="dinnerroute_title">
              <SelfAdminDinnerRoutePage />
            </SelfAdminPageContainer>
          </Suspense>
        </Route>

        <Route path={`${path}/teampartnerwish/:participantId`}>
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="team_partner_wish_manage_title">
              <SelfAdminManageTeamPartnerWishPage />
            </SelfAdminPageContainer>
          </Suspense>
        </Route>

        <Route path="/">
          <Box my={3}>
            <Alert severity={"error"} variant={"outlined"}>
              <Span>
                <Trans i18nKey={"selfadmin:invalid_url"} values={{adminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}}
                                  // @ts-ignore
                                components={{ anchor: <LinkExtern /> }} />
              </Span>
            </Alert>
          </Box>
        </Route>
    </Switch>
  );
}
