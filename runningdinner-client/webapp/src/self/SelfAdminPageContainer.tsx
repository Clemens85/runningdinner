import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { fetchSelfAdminSessionData, getLanguageOfDinnerSelfAdmin, isStringNotEmpty, Parent, useSelfAdminDispatch, useSelfAdminSelector } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { LanguageSwitch } from '../common/i18n/LanguageSwitch';
import { commonStyles } from '../common/theme/CommonStyles';

export interface SelfAdminPageContainerProps extends Parent {
  htmlPageTitleI18n: string;
}

export function SelfAdminPageContainer({ children, htmlPageTitleI18n }: SelfAdminPageContainerProps) {
  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';

  const { i18n, t } = useTranslation('selfadmin');

  const dispatch = useSelfAdminDispatch();

  const dinnerLanguage = useSelfAdminSelector(getLanguageOfDinnerSelfAdmin);

  React.useEffect(() => {
    dispatch(fetchSelfAdminSessionData({ selfAdminId, participantId }));
  }, [dispatch, selfAdminId, participantId]);

  React.useEffect(() => {
    if (isStringNotEmpty(dinnerLanguage)) {
      i18n.changeLanguage(dinnerLanguage);
      console.log(`Changed language to ${dinnerLanguage}`);
    }
  }, [dinnerLanguage, i18n]);

  return (
    <>
      <Grid container justifyContent={'center'}>
        <Grid
          sx={commonStyles.textAlignRight}
          size={{
            xs: 12,
            md: 8,
            lg: 8,
          }}
        >
          <Box mt={2} mb={-3}>
            <LanguageSwitch />
          </Box>
        </Grid>
      </Grid>
      <Grid container justifyContent={'center'}>
        <Grid
          size={{
            xs: 12,
            md: 8,
            lg: 8,
          }}
        >
          {children}
        </Grid>
      </Grid>
      <title>{t(htmlPageTitleI18n)}</title>
    </>
  );
}
