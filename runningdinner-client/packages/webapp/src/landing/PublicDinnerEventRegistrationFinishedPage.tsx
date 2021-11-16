import React from 'react';
import {useParams} from "react-router-dom";
import {Fetch} from "../common/Fetch";
import {BasePublicDinnerProps, findPublicRunningDinnerByPublicId} from "@runningdinner/shared";
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import {Alert, AlertTitle} from "@material-ui/lab";
import LinkExtern from "../common/theme/LinkExtern";


export function PublicDinnerEventRegistrationFinishedPage() {
  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId;

  return <Fetch asyncFunction={findPublicRunningDinnerByPublicId}
                parameters={[publicDinnerId]}
                render={publicRunningDinner =>
                  <div>
                    <PublicDinnerEventRegistrationFinishedView publicRunningDinner={publicRunningDinner.result} />
                  </div>
                } />;
}


export function PublicDinnerEventRegistrationFinishedView({publicRunningDinner}: BasePublicDinnerProps) {

  const {t} = useTranslation(["landing", "common"]);

  return (
    <>
      <PageTitle>{t("landing:registration_finished_headline")}</PageTitle>
      <Alert severity={"success"} variant={"outlined"}>
        <AlertTitle>{t('common:congratulation')}</AlertTitle>
        <Span>
          <Trans i18nKey={"landing:registration_finished_text"}
                 // @ts-ignore
                 components={{ anchor: <LinkExtern />  }}
                 values={{ adminEmail: publicRunningDinner.adminEmail }} />
        </Span>
      </Alert>
    </>
  );
}