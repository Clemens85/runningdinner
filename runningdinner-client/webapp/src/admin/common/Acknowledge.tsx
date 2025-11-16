import React from 'react';
import { acknowledgeRunningDinnerAsync, BaseRunningDinnerProps, CONSTANTS, setUpdatedRunningDinner } from '@runningdinner/shared';
import { PageTitle, Span } from '../../common/theme/typography/Tags';
import { Alert, AlertTitle } from '@mui/material';
import LinkIntern from '../../common/theme/LinkIntern';
import { Trans, useTranslation } from 'react-i18next';
import { LinearProgress } from '@mui/material';
import LinkExtern from '../../common/theme/LinkExtern';
import { useParams } from 'react-router-dom';
import { useAdminNavigation } from '../AdminNavigationHook';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

export default function Acknowledge({ runningDinner }: BaseRunningDinnerProps) {
  const { adminId } = runningDinner;
  const dispatch = useDispatch();

  const { t } = useTranslation('admin');

  const { generateDashboardPath } = useAdminNavigation();

  const urlParams = useParams<Record<string, string>>();
  const acknowledgeId = urlParams.acknowledgeId || '';

  const acknowedgeDinnerQuery = useQuery({
    queryKey: ['acknowledgeRunningDinner', adminId, acknowledgeId],
    queryFn: () => acknowledgeRunningDinnerAsync(adminId, acknowledgeId),
  });

  React.useEffect(() => {
    if (acknowedgeDinnerQuery.data) {
      dispatch(setUpdatedRunningDinner(acknowedgeDinnerQuery.data));
    }
  }, [acknowedgeDinnerQuery.data]);

  return (
    <>
      <PageTitle>{t('admin:runningdinner_acknowledge_title')}</PageTitle>
      {acknowedgeDinnerQuery.isPending && <LinearProgress color="secondary" />}
      {acknowedgeDinnerQuery.data && (
        <Alert severity={'success'} variant={'outlined'}>
          <AlertTitle>{t('admin:runningdinner_acknowledge_congratulation_title')}</AlertTitle>
          <Span i18n={'admin:runningdinner_acknowledge_congratulation_text'} />
          <LinkIntern pathname={generateDashboardPath(adminId)}>{t('admin:goto_dashboard')}</LinkIntern>
        </Alert>
      )}
      {acknowedgeDinnerQuery.error && (
        <Alert severity={'error'} variant={'outlined'}>
          <AlertTitle>{t('admin:runningdinner_acknowledge_error_title')}</AlertTitle>
          <Span>
            <Trans
              i18nKey={'admin:runningdinner_acknowledge_error_text'}
              values={{ adminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL }}
              // @ts-ignore
              components={{ anchor: <LinkExtern /> }}
            />
          </Span>
        </Alert>
      )}
    </>
  );
}
