import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getSelfAdminSessionDataFetchSelector, updateSelfTeamPartnerWish, useBackendIssueHandler, useSelfAdminSelector } from '@runningdinner/shared';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useUrlQuery } from '../common/hooks/useUrlQuery';
import { useNotificationHttpError } from '../common/NotificationHttpErrorHook';
import { getDecodedQueryParam } from '../common/QueryParamDecoder';
import { commonStyles } from '../common/theme/CommonStyles';
import { PrimaryButton } from '../common/theme/PrimaryButton';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle, Span } from '../common/theme/typography/Tags';

export default function SelfAdminManageTeamPartnerWishPage() {
  const { data: selfAdminSessionData } = useSelfAdminSelector(getSelfAdminSessionDataFetchSelector);
  const query = useUrlQuery();

  if (!selfAdminSessionData) {
    return null;
  }

  const teamPartnerWishQueryParam = getDecodedQueryParam(query, 'email');
  return <SelfAdminManageTeamPartnerWishView teamPartnerWishQueryParam={teamPartnerWishQueryParam} />;
}

interface SelfAdminManageTeamPartnerWishViewProps {
  teamPartnerWishQueryParam: string;
}

function SelfAdminManageTeamPartnerWishView({ teamPartnerWishQueryParam }: SelfAdminManageTeamPartnerWishViewProps) {
  const { t } = useTranslation(['selfadmin', 'common']);

  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';

  const [teamPartnerWishEmail, setTeamPartnerWishEmail] = useState(teamPartnerWishQueryParam);
  const [teamPartnerWishUpdateSucceeded, setTeamPartnerWishUpdateSucceeded] = useState(false);

  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['selfadmin', 'common'],
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('lg'));
  const fullWidthProps = isSmallDevice ? commonStyles.fullWidth : {};

  async function handleSubmit() {
    try {
      await updateSelfTeamPartnerWish({ selfAdminId, participantId }, teamPartnerWishEmail);
      setTeamPartnerWishUpdateSucceeded(true);
    } catch (e) {
      showHttpErrorDefaultNotification(e, { showMessageForValidationErrorsWithoutSource: true });
    }
  }

  function handleTeamPartnerWishInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTeamPartnerWishEmail(event.target.value);
  }

  if (teamPartnerWishUpdateSucceeded) {
    return (
      <Box my={8}>
        <Alert severity={'success'}>
          <AlertTitle>{t('common:congratulation')}</AlertTitle>
          <Span i18n={'selfadmin:manage_teampartner_wish_success'} />
        </Alert>
      </Box>
    );
  }

  return (
    <form>
      <PageTitle>{t('selfadmin:manage_teampartner_wish_title')}</PageTitle>
      <Paragraph>{t('selfadmin:manage_teampartner_wish_help')}</Paragraph>
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label={t('common:teampartner_wish')} variant="outlined" fullWidth value={teamPartnerWishEmail} onChange={handleTeamPartnerWishInputChange} />
          </Grid>
        </Grid>
      </Box>
      <Box my={3}>
        <Grid container justifyContent={'flex-end'} direction={'row'}>
          <Grid item xs={isSmallDevice ? 12 : undefined}>
            <PrimaryButton onClick={handleSubmit} sx={fullWidthProps} disabled={false} size={'large'}>
              {t('common:save')}
            </PrimaryButton>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
}
