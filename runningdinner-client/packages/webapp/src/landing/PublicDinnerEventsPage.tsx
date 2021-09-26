import React from 'react';
import {PageTitle, Span, Subtitle} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {Fetch} from "../common/Fetch";
import {
  AddressLocation,
  findPublicRunningDinnersAsync,
  getTruncatedText,
  isArrayNotEmpty, LocalDate,
  PublicRunningDinner
} from "@runningdinner/shared";
import {Box, CardActions, Grid} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import Paragraph from "../common/theme/typography/Paragraph";
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {useLandingStyles} from "./LandingStyles";
import {isLocalDevEnv} from "../common/EnvService";

export function PublicDinnerEventsPage() {

  const {t} = useTranslation(["landing", "common"]);

  return <Fetch asyncFunction={findPublicRunningDinnersAsync}
                parameters={[]}
                render={publicRunningDinners =>
                    <div>
                      <PageTitle>{t('landing:public_dinner_events_headline')}</PageTitle>
                      { isArrayNotEmpty(publicRunningDinners.result) ? <PublicDinnerEventsListPage publicRunningDinners={publicRunningDinners.result} />
                                                                     : <NoPublicDinnerEventsPage /> }
                    </div>
                } />;
}

export interface PublicDinnerEventsListProps {
  publicRunningDinners: PublicRunningDinner[];
}

function PublicDinnerEventsListPage({publicRunningDinners}: PublicDinnerEventsListProps) {

  const {t} = useTranslation("common");
  const landingStyles = useLandingStyles();

  function renderPublicDinnerEventCard(publicRunningDinner: PublicRunningDinner) {

    const title = publicRunningDinner.publicSettings.title;
    const publicDescriptionTeaser = getTruncatedText(publicRunningDinner.publicSettings.description, 256);

    let publicDinnerUrl = publicRunningDinner.publicSettings.publicDinnerUrl;
    if (isLocalDevEnv()) {
      publicDinnerUrl = publicDinnerUrl
                          .replace("localhost/", "localhost:3000/")
                          .replace("/running-dinner-event/", "/running-dinner-events/");
    }

    return (
      <Grid item xs={12} md={4} key={publicRunningDinner.publicSettings.publicDinnerId}>
        <Card className={landingStyles.teaserCard}>
          <CardContent>
            <Subtitle>{title}</Subtitle>
            <Box>
              <Span>{publicDescriptionTeaser}</Span>
            </Box>
            <Box pt={2}>
              <PrimaryButton href={publicDinnerUrl}>{t('common:more')}</PrimaryButton>
            </Box>
          </CardContent>
          <CardActions>
            <div style={{ display: 'flex', justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: 'flex'}}>
                <LocationOnIcon color={"primary"} />
                <Paragraph><AddressLocation cityName={publicRunningDinner.city} zip={publicRunningDinner.zip} /></Paragraph>
              </div>
              <div style={{ display: 'flex' }}>
                <CalendarTodayIcon color={"primary"} />
                <Paragraph><LocalDate date={publicRunningDinner.date} /></Paragraph>
              </div>
            </div>
          </CardActions>
        </Card>
      </Grid>
    );
  }

  return (
    <div>
      <Grid container spacing={6} className={landingStyles.teaserCardRow}>
        { publicRunningDinners.map(publicRunningDinner => renderPublicDinnerEventCard(publicRunningDinner)) }
      </Grid>
    </div>
  );
}

function NoPublicDinnerEventsPage() {
  return (
    <div>
      No Dinner
    </div>
  );
}