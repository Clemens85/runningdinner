import {Container, Grid} from '@mui/material';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import LinkExtern from '../common/theme/LinkExtern';
import { PrimaryRouterButton } from '../common/theme/PrimaryButton';
import {Banner, SearchPublicEventsTeaserButton, TypographyTransparentWhite} from './LandingStyles';
import {Link as RouterLink} from "react-router-dom";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "../common/mainnavigation/NavigationPaths";

export function LandingBanner() {

  const {t} = useTranslation("landing");

  return (
    <Banner>
      <Container maxWidth={false}>

        <Grid container>
          <Grid item xs={12} sx={{ pt: 6, textAlign: 'center'}}>
            <TypographyTransparentWhite variant="h3" component={"h3"} gutterBottom>
              <strong>{t("landing:teaser_what_is_running_dinner_headline")}</strong>
            </TypographyTransparentWhite>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} sx={{ pt: 3, textAlign: 'center'}}>
            <TypographyTransparentWhite variant="h6" component="h6" gutterBottom>
              <strong>
                <Trans i18nKey='landing:teaser_running_dinner_general_description' 
                      // @ts-ignore
                      components={{ anchor: <LinkExtern /> }} 
                />
              </strong>
            </TypographyTransparentWhite>
          </Grid>

          <Grid item xs={12} sx={{ pt: 3, textAlign: 'center'}}>
            <TypographyTransparentWhite variant="h6" component="h6" gutterBottom>
                <strong>
                  <Trans i18nKey='landing:teaser_running_dinner_general_application' />
                </strong>
            </TypographyTransparentWhite>
          </Grid>
        </Grid>


        <Grid container justify='center' spacing={4} sx={{ justifyContent: "center", py: 4 }}>
          <Grid item>
            <PrimaryRouterButton to={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`} size='large'>
              {t('landing:teaser_organize_event_text')}
            </PrimaryRouterButton>
          </Grid>
          <Grid item>
            <SearchPublicEventsTeaserButton size='large'
                                            variant={"outlined"}
                                            to={`/${RUNNING_DINNER_EVENTS_PATH}`}
                                            component={RouterLink}>{t('landing:teaser_search_public_event_text')}</SearchPublicEventsTeaserButton>
          </Grid>
        </Grid>
      </Container>
    </Banner>
  );
}