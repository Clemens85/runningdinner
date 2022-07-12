import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import {Box, Grid} from "@material-ui/core";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {DEMO_WIZARD_ROOT_PATH, WIZARD_ROOT_PATH} from "../common/mainnavigation/NavigationPaths";
import { TeaserCard } from './TeaserCard';
import {useLandingStyles} from "./LandingStyles";

export function LandingWizard() {

  const {t} = useTranslation("landing");
  const landingStyles = useLandingStyles();

  const gridSpacing = 6;

  return (
    <Box pl={3} pr={3}>
      <PageTitle>{t("create_your_own_event_hedline")}</PageTitle>
      <div>
        <Grid container spacing={gridSpacing} alignItems="stretch" className={landingStyles.teaserCardRow}>
          <Grid item xs={12} md={6}>
            <TeaserCard titleI18nKey={"quickstart"}>
              <Span i18n={"landing:quickstart_description"} />
              <Box pt={2}>
                <PrimaryButton href={WIZARD_ROOT_PATH} target="_blank" data-testid={"wizard-open-action"}>{t('common:open_wizard')}</PrimaryButton>
              </Box>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <TeaserCard titleI18nKey={"landing:uncertain_headline"}>
              <Span><Trans i18nKey={"landing:uncertain_description"} /></Span>
              <Box pt={2}>
                <PrimaryButton href={DEMO_WIZARD_ROOT_PATH} target="_blank" data-testid={"wizard-open-action-demo"}>{t('landing:create_demo_dinner_link')}</PrimaryButton>
              </Box>
            </TeaserCard>
          </Grid>
        </Grid>
      </div>

      <Box pt={2}>
        <PageTitle>{t("common:features")}</PageTitle>
      </Box>
      <div>
        <Grid container spacing={gridSpacing} alignItems={"stretch"} className={landingStyles.teaserCardRow}>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"common:visibilities"}>
              <Span i18n={"landing:visibilities_text"} />
              <ul>
                <li><strong>{t('common:registrationtype_closed')}</strong> <span>{t('common:registrationtype_closed_description')}</span></li>
                <li><strong>{t('common:registrationtype_open')}</strong> <span>{t('common:registrationtype_open_description')}</span></li>
                <li><strong>{t('common:registrationtype_public')}</strong> <span>{t('common:registrationtype_public_description')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"common:team_arrangements"}>
              <ul>
                <li><span>{t('landing:team_arrangements_meal_feature')}</span></li>
                <li><span>{t('landing:team_arrangements_distribution_feature')}</span></li>
                <li><span>{t('landing:team_arrangements_swap_feature')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"common:dinner_route"}>
              <ul>
                <li><span>{t('landing:dinner_route_calculation_feature')}</span></li>
                <li><span>{t('landing:dinner_route_view_feature')}</span></li>
                <li><span>{t('landing:dinner_route_googlemaps_feature')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
        </Grid>
      </div>

      <div>
        <Grid container spacing={gridSpacing} alignItems={"stretch"} className={landingStyles.teaserCardRow}>
          <Grid item xs={12} md={4} >
            <TeaserCard titleI18nKey={"landing:mail_sending_personalized"}>
              <Span i18n={"landing:mail_sending_personalized_description"} />
              <ul>
                <li><span>{t('landing:mail_sending_personalized_participants')}</span></li>
                <li><span>{t('landing:mail_sending_personalized_teams')}</span></li>
                <li><span>{t('landing:mail_sending_personalized_dinnerroutes')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:participant_management_headline"}>
              <ul>
                <li><span>{t('landing:participant_management_crud_feature')}</span></li>
                <li><span>{t('landing:participant_management_overview_feature')}</span></li>
                <li><span>{t('landing:participant_management_waitinglist_feature')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:participant_features"}>
              <ul>
                <li><span>{t('landing:participant_feature_self_registrate')}</span></li>
                <li><span>{t('landing:participant_feature_change_host')}</span></li>
                <li><span>{t('landing:participant_feature_live_dinnerroute')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
        </Grid>
      </div>

      <div>
        <Grid container spacing={gridSpacing} alignItems={"stretch"} className={landingStyles.teaserCardRow}>
          <Grid item xs={12} md={4} >
            <TeaserCard titleI18nKey={"common:Dashboard"}>
              <ul>
                <li><span>{t('landing:misc_feature_dashboard')}</span></li>
                <li><span>{t('landing:misc_feature_new_participants')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"common:misc"}>
              <ul>
                <li><span>{t('landing:misc_feature_cancel_teams')}</span></li>
                <li><span>{t('landing:misc_feature_team_partner_wish')}</span></li>
                <li><span>{t('landing:misc_feature_languages')}</span></li>
              </ul>
            </TeaserCard>
          </Grid>
        </Grid>
      </div>


    </Box>
  );
}