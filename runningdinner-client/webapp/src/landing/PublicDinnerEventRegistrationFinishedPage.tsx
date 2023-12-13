import React from 'react';
import {useParams} from "react-router-dom";
import {BasePublicDinnerProps, assertDefined, isQuerySucceeded, isStringNotEmpty, useFindPublicDinner} from "@runningdinner/shared";
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import { Alert, AlertTitle } from '@mui/material';
import LinkExtern from "../common/theme/LinkExtern";
import { FetchProgressBar } from '../common/FetchProgressBar';


export function PublicDinnerEventRegistrationFinishedPage() {
  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId;

  const findPublicDinnerQuery = useFindPublicDinner(publicDinnerId || '');
  if (!isQuerySucceeded(findPublicDinnerQuery)) {
    return <FetchProgressBar {...findPublicDinnerQuery} />;
  }
  assertDefined(findPublicDinnerQuery.data);
  return <PublicDinnerEventRegistrationFinishedView publicRunningDinner={findPublicDinnerQuery.data} />;
}


function PublicDinnerEventRegistrationFinishedView({publicRunningDinner}: BasePublicDinnerProps) {

  const {t} = useTranslation(["landing", "common"]);

  const i18nKey = publicRunningDinner.paymentOptions ? "landing:registration_finished_payment_text" : "landing:registration_finished_text";

  React.useEffect(() => {
    if (isStringNotEmpty(publicRunningDinner?.paymentOptions?.redirectAfterPurchaseLink)) {
      // @ts-ignore
      window.location.href = publicRunningDinner.paymentOptions.redirectAfterPurchaseLink;
    }
  }, [publicRunningDinner?.paymentOptions?.redirectAfterPurchaseLink]);

  return (
    <>
      <PageTitle>{t("landing:registration_finished_headline")}</PageTitle>
      <Alert severity={"success"} variant={"outlined"}>
        <AlertTitle>{t('common:congratulation')}</AlertTitle>
        <Span>
          <Trans i18nKey={i18nKey}
                 // @ts-ignore
                 components={{ anchor: <LinkExtern />  }}
                 values={{ adminEmail: publicRunningDinner.adminEmail }} />
        </Span>
      </Alert>
    </>
  );
}