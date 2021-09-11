import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {Box, Grid} from "@material-ui/core";
import { TeaserCard } from './TeaserCard';
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {Link as RouterLink} from "react-router-dom";
import Button from "@material-ui/core/Button";

export function LandingStart() {

  const {t} = useTranslation("landing");

  const gridSpacing = 6;

  return (
    <div>
      <div style={{ height: "300px", backgroundColor: "#ccc" }}></div>
      <PageTitle>{t("for_organizers_headline")}</PageTitle>
      <div>
        <Grid container spacing={gridSpacing} alignItems={"stretch"} style={{ maxHeight:'350px'}}>
          <Grid item xs={12} md={4} >
            <TeaserCard titleI18nKey={"landing:create_event_headline"}>
              <Span i18n={"landing:create_event_description"} html={true} />
              <Box pt={2}>
                <PrimaryButton href={"/create-running-dinner"}>{t('landing:create_event_headline')}</PrimaryButton>
              </Box>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:manage_event_headline"}>
              <Span i18n={"landing:manage_event_description"} />
              <Box pt={2}>
                <Button color={"primary"}
                        variant={"outlined"}
                        to={"/create-running-dinner"}
                        component={RouterLink}>{t('landing:manage_event_link')}</Button>
              </Box>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:manage_event_party_headline"}>
              <Span i18n={"landing:manage_event_party_description"}  html={true} />
            </TeaserCard>
          </Grid>
        </Grid>
      </div>

      <PageTitle>{t("for_participants_headline")}</PageTitle>
      <div>
        <Grid container spacing={gridSpacing} alignItems={"stretch"} style={{ maxHeight:'350px'}}>
          <Grid item xs={12} md={4} >
            <TeaserCard titleI18nKey={"landing:discover_public_events_headline"}>
              <Span i18n={"landing:discover_public_events_description"} />
              <Box pt={2}>
                <PrimaryButton href={"/running-dinner-events"}>{t('landing:discover_public_events_link')}</PrimaryButton>
              </Box>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:public_events_no_event_found_headline"}>
              <Span i18n={"landing:public_events_no_event_found_description"} html={true}/>
            </TeaserCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TeaserCard titleI18nKey={"landing:privacy_question_headline"}>
              <Span i18n={"landing:privacy_question_description"} html={true}/>
              <Box pt={2}>
                <Button color={"primary"}
                        variant={"outlined"}
                        to={"/impressum"}
                        component={RouterLink}>{t('landing:privacy_more_infos_link')}</Button>
              </Box>
            </TeaserCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}