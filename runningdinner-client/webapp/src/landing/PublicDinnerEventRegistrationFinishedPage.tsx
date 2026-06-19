import { Alert, AlertTitle } from '@mui/material';
import { assertDefined, BasePublicDinnerProps, isQuerySucceeded, isStringNotEmpty, useFindPublicDinner } from '@runningdinner/shared';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { FetchProgressBar } from '../common/FetchProgressBar';
import LinkExtern from '../common/theme/LinkExtern';
import { PageTitle, Span } from '../common/theme/typography/Tags';

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

function PublicDinnerEventRegistrationFinishedView({ publicRunningDinner }: BasePublicDinnerProps) {
  const { t } = useTranslation(['landing', 'common']);

  const i18nKey = publicRunningDinner.paymentOptions ? 'landing:registration_finished_payment_text' : 'landing:registration_finished_text';

  React.useEffect(() => {
    if (isStringNotEmpty(publicRunningDinner?.paymentOptions?.redirectAfterPurchaseLink)) {
      window.location.href = publicRunningDinner.paymentOptions.redirectAfterPurchaseLink;
    }
  }, [publicRunningDinner?.paymentOptions?.redirectAfterPurchaseLink]);

  return (
    <>
      <PageTitle>{t('landing:registration_finished_headline')}</PageTitle>
      <Alert severity={'success'} variant={'outlined'}>
        <AlertTitle>{t('common:congratulation')}</AlertTitle>
        <Span>
          <Trans
            i18nKey={i18nKey}
            // @ts-expect-error -- type suppression
            components={{ anchor: <LinkExtern /> }}
            values={{ adminEmail: publicRunningDinner.adminEmail }}
          />
        </Span>
      </Alert>
    </>
  );
}
