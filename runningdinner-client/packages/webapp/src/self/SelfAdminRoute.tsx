import {Route, Routes } from "react-router-dom";
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


export function SelfAdminRoute() {

  return (
    <Routes>
        <Route path={`:selfAdminId/teamhost/:participantId/:teamId`} element={
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="host_manage_title">
              <SelfAdminChangeTeamHostPage />
            </SelfAdminPageContainer>
          </Suspense>
        } />

        <Route path={`:selfAdminId/dinnerroute/:participantId/:teamId`} element={
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="dinnerroute_title">
              <SelfAdminDinnerRoutePage />
            </SelfAdminPageContainer>
          </Suspense>
        } />

        <Route path={`:selfAdminId/teampartnerwish/:participantId`} element={
          <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
            <SelfAdminPageContainer htmlPageTitleI18n="team_partner_wish_manage_title">
              <SelfAdminManageTeamPartnerWishPage />
            </SelfAdminPageContainer>
          </Suspense>
        } />

        <Route path="*" element={
          <Box my={3}>
            <Alert severity={"error"} variant={"outlined"}>
              <Span>
                <Trans i18nKey={"selfadmin:invalid_url"} values={{adminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}}
                  // @ts-ignore
                       components={{ anchor: <LinkExtern /> }} />
              </Span>
            </Alert>
          </Box>
        } />

    </Routes>
  );
}
