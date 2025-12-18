import { Container, Grid } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import LinkExtern from '../common/theme/LinkExtern';
import { PrimaryRouterButton } from '../common/theme/PrimaryButton';
import { Banner, SearchPublicEventsTeaserButton, TypographyTransparentWhite } from './LandingStyles';

export function LandingBanner() {
  const { t } = useTranslation('landing');

  return (
    <Banner>
      <Container maxWidth={false}>
        <Grid container>
          <Grid sx={{ pt: 6, textAlign: 'center' }} size={12}>
            <TypographyTransparentWhite variant="h3" gutterBottom>
              <strong>{t('landing:teaser_what_is_running_dinner_headline')}</strong>
            </TypographyTransparentWhite>
          </Grid>
        </Grid>

        <Grid container>
          <Grid sx={{ pt: 3, textAlign: 'center' }} size={12}>
            <TypographyTransparentWhite variant="h6" gutterBottom>
              <strong>
                <Trans i18nKey="landing:teaser_running_dinner_general_description" components={{ anchor: <LinkExtern href="" /> }} />
              </strong>
            </TypographyTransparentWhite>
          </Grid>

          <Grid sx={{ pt: 3, textAlign: 'center' }} size={12}>
            <TypographyTransparentWhite variant="h6" gutterBottom>
              <strong>
                <Trans i18nKey="landing:teaser_running_dinner_general_application" />
              </strong>
            </TypographyTransparentWhite>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ justifyContent: 'center', py: 4 }}>
          <Grid>
            <PrimaryRouterButton to={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`} size="large">
              {t('landing:teaser_organize_event_text')}
            </PrimaryRouterButton>
          </Grid>
          <Grid>
            {/* @ts-expect-error no real issue */}
            <SearchPublicEventsTeaserButton size="large" variant={'outlined'} to={`/${RUNNING_DINNER_EVENTS_PATH}`} component={RouterLink}>
              {t('landing:teaser_search_public_event_text')}
            </SearchPublicEventsTeaserButton>
          </Grid>
        </Grid>
      </Container>
    </Banner>
  );
}
