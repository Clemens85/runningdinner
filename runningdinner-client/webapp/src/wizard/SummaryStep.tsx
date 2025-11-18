import { Box, Grid, Typography } from '@mui/material';
import { useWizardSelector } from '@runningdinner/shared';
import { getAdministrationUrlSelector, setNextNavigationStep, setPreviousNavigationStep } from '@runningdinner/shared';
import { FinishNavigationStep } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import LinkExtern from '../common/theme/LinkExtern';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle, Span } from '../common/theme/typography/Tags';

export default function SummaryStep() {
  const { t } = useTranslation(['wizard', 'common']);
  const administrationUrl = useWizardSelector(getAdministrationUrlSelector);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setNextNavigationStep(undefined));
    dispatch(setPreviousNavigationStep(FinishNavigationStep));
     
  }, [dispatch]);

  return (
    <div>
      <PageTitle>{t('done')}</PageTitle>
      <Grid container>
        <Grid item xs={12}>
          <Span i18n="wizard:administration_link" />
          <Paragraph>
            <strong>{administrationUrl}</strong>
          </Paragraph>
          <Box my={1}>
            <Span i18n="wizard:administration_link_help" />
          </Box>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12} md={6}>
          <LinkExtern href={administrationUrl} self={true}>
            <Typography variant={'body1'} component={'span'}>
              {t('wizard:administration_link_open')}
            </Typography>
          </LinkExtern>
        </Grid>
      </Grid>
    </div>
  );
}
