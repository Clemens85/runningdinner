import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import LinkExtern from '../common/theme/LinkExtern';
import { PrimaryRouterButton } from '../common/theme/PrimaryButton';
import { useLandingStyles } from './LandingStyles';
import {Link as RouterLink} from "react-router-dom";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "../common/mainnavigation/NavigationPaths";
import { SpacingGrid } from '../common/theme/SpacingGrid';
import useCommonStyles from '../common/theme/CommonStyles';

export function LandingBanner() {

  const landingStyles = useLandingStyles();
  const commonStyles = useCommonStyles();

  const {t} = useTranslation("landing");

  const textColor = "textPrimary";

  return (
    <div className={landingStyles.banner}>
      <Container maxWidth={false}>

        <SpacingGrid container>
          <SpacingGrid item xs={12} pt={6} className={commonStyles.textAlignCenter}>
            <Typography variant="h3" component={"h3"} color={textColor} gutterBottom className={landingStyles.bannerTypographyWhite}>
              <strong>{t("landing:teaser_what_is_running_dinner_headline")}</strong>
            </Typography>
          </SpacingGrid>
        </SpacingGrid>

        <SpacingGrid container>
          <SpacingGrid item xs={12} pt={3} className={commonStyles.textAlignCenter}>
            <Typography variant="h6" component="h6" color={textColor} gutterBottom className={landingStyles.bannerTypographyWhite} >
              <strong>
                <Trans i18nKey='landing:teaser_running_dinner_general_description' 
                      // @ts-ignore
                      components={{ anchor: <LinkExtern /> }} 
                />
              </strong>
            </Typography>
          </SpacingGrid>

          <SpacingGrid item xs={12} pt={3} className={commonStyles.textAlignCenter}>
            <Typography variant="h6" component="h6" color={textColor} gutterBottom className={landingStyles.bannerTypographyWhite} >
                <strong>
                  <Trans i18nKey='landing:teaser_running_dinner_general_application' />
                </strong>
            </Typography>
          </SpacingGrid>
        </SpacingGrid>


        <SpacingGrid container py={4} justify='center' spacing={4}>
          <SpacingGrid item>
            <PrimaryRouterButton to={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`} size='large'>
              {t('landing:teaser_organize_event_text')}
            </PrimaryRouterButton>
          </SpacingGrid>
          <SpacingGrid item>
            <Button className={landingStyles.teaserSearchPublicEventsButton}
                    size='large'
                    variant={"outlined"}
                    to={`/${RUNNING_DINNER_EVENTS_PATH}`}
                    component={RouterLink}>{t('landing:teaser_search_public_event_text')}</Button>
          </SpacingGrid>
        </SpacingGrid>
      </Container>
    </div>
  );
}