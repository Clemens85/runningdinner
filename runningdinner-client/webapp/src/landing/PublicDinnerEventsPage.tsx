import {PageTitle, Span, Subtitle} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {
  AddressLocation,
  findPublicRunningDinnersAsync,
  isArrayNotEmpty, isQuerySucceeded, LocalDate,
  PublicRunningDinner
} from "@runningdinner/shared";
import {Box, CardActions, Grid} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import Paragraph from "../common/theme/typography/Paragraph";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {CardFlexibleHeight} from "./LandingStyles";
import {isLocalDevEnv} from "../common/EnvService";
import { Alert, AlertTitle } from '@mui/material';
import LinkIntern from "../common/theme/LinkIntern";
import {LANDING_CREATE_RUNNING_DINNER_PATH} from "../common/mainnavigation/NavigationPaths";
import { TextViewHtml } from '../common/TextViewHtml';
import { useQuery } from '@tanstack/react-query';
import { FetchProgressBar } from '../common/FetchProgressBar';

export function PublicDinnerEventsPage() {

  const {t} = useTranslation(["landing", "common"]);

  const findPublicRunningDinnersQuery = useQuery({
    queryKey:["findPublicRunningDinners"],
    queryFn: () => findPublicRunningDinnersAsync()
  });
  if (!isQuerySucceeded(findPublicRunningDinnersQuery)) {
    return <FetchProgressBar {...findPublicRunningDinnersQuery} />
  }
  
  const publicRunningDinners = findPublicRunningDinnersQuery.data || [];
  return (
    <Box>
      <PageTitle>{t('landing:public_dinner_events_headline')}</PageTitle>
      { isArrayNotEmpty(publicRunningDinners) ? <PublicDinnerEventsListPage publicRunningDinners={publicRunningDinners} />
                                              : <NoPublicDinnerEventsPage /> }
    </Box>
  );
}

export interface PublicDinnerEventsListProps {
  publicRunningDinners: PublicRunningDinner[];
}

function PublicDinnerEventsListPage({publicRunningDinners}: PublicDinnerEventsListProps) {

  const {t} = useTranslation("common");

  function renderPublicDinnerEventCard(publicRunningDinner: PublicRunningDinner) {

    const title = publicRunningDinner.publicSettings.title;

    let publicDinnerUrl = publicRunningDinner.publicSettings.publicDinnerUrl;
    if (isLocalDevEnv()) {
      publicDinnerUrl = publicDinnerUrl
                          .replace("localhost/", "localhost:3000/")
                          .replace("/running-dinner-event/", "/running-dinner-events/");
    }

    return (
      <Grid item xs={12} md={4} key={publicRunningDinner.publicSettings.publicDinnerId} sx={{ pb: 3 }}>
        <CardFlexibleHeight>
          <CardContent>
            <Subtitle>{title}</Subtitle>
            <Box>
              <Span>
                <TextViewHtml text={publicRunningDinner.publicSettings.description} limit={256} />
              </Span>
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
        </CardFlexibleHeight>
      </Grid>
    );
  }

  return (
    <div>
      <Grid container spacing={6}>
        { publicRunningDinners.map(publicRunningDinner => renderPublicDinnerEventCard(publicRunningDinner)) }
      </Grid>
    </div>
  );
}

function NoPublicDinnerEventsPage() {

  const {t} = useTranslation("landing");

  return (
    <div>
      <Alert severity={"success"} variant={"outlined"}>
        <AlertTitle>{t('landing:public_dinner_events_empty_headline')}</AlertTitle>
        <Span i18n={"landing:public_dinner_events_empty_text"} />
        <LinkIntern pathname={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`}><Paragraph>{t("landing:public_dinner_events_empty_goto_wizard")}</Paragraph></LinkIntern>
      </Alert>
    </div>
  );
}