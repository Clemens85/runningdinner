import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {Box, Container, Typography, useMediaQuery, useTheme} from "@material-ui/core";
import { TeaserCard } from './TeaserCard';
import {PrimaryRouterButton} from "../common/theme/PrimaryButton";
import {Link as RouterLink} from "react-router-dom";
import { Button } from '@material-ui/core';
import {useLandingStyles} from "./LandingStyles";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "../common/mainnavigation/NavigationPaths";
import { SpacingGrid } from '../common/theme/SpacingGrid';
import Paragraph from '../common/theme/typography/Paragraph';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css'
import participantsImg from "./images/participants.png";
import teamsImg from "./images/teams.png";
import teamMailsImg from "./images/team-mails.png";
import wizardImg1 from "./images/wizard1.png";
import wizardImg2 from "./images/wizard2.png";
import dinnerRouteImg from "./images/dinner-route.png";
import selfServiceImg from "./images/selfservice-team-host.png";
import registrationImg from "./images/registration.png";
import dashboardImg from "./images/dashboard.png";
import useElementSize from '../common/hooks/ElementSizeHook';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import EventSeatIcon from '@material-ui/icons/EventSeat';
import GroupIcon from '@material-ui/icons/Group';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';


export function LandingStart() {

  const {t} = useTranslation(["landing", "common"]);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  // const isXlDevice = useMediaQuery(theme.breakpoints.up('lg'));
  const landingStyles = useLandingStyles();

  const [imageWidth, setImageWidth] = React.useState(250);

  const [columnRef, { width: columnWidth }] = useElementSize();
  React.useEffect(() => {
    const columnWidthMinusSpacing = columnWidth - 128;
    const divisor = isMobileDevice ? 1 : 3;
    const calculatedWidthPerImage = columnWidthMinusSpacing / divisor;
    setImageWidth(calculatedWidthPerImage <= 0 ? 250 : calculatedWidthPerImage);
  }, [columnWidth, isMobileDevice]);

  const mbTeaser = 6;

  const imageRowDirection = isMobileDevice ? "column" : "row";
  const imageSpacing = isMobileDevice ? 3 : 1;
  const imageAlignItems = isMobileDevice ? "center" : "baseline";
  
  return (
    <div>

      <Container maxWidth="xl">
        <SpacingGrid container mb={4} mt={6}>
          <SpacingGrid item xs={12}>
            <Typography variant={"h4"} component="h4" color="textPrimary">{t("landing:teaser_how_does_it_work")}</Typography>
          </SpacingGrid>
        </SpacingGrid>
      </Container>

      <div className={landingStyles.teaserExplanationBox}>
        <SpacingGrid container mb={4} mt={2} justify='center' spacing={4}>
          <SpacingGrid item xs={12} md={6}>
            <Box my={2} display="flex" alignItems={"center"}>
              <GroupIcon color="primary" className={landingStyles.teaserExplanationIconPadding} fontSize='large'/>
              <Paragraph i18n="landing:teaser_workflow_team_generation"></Paragraph>
            </Box>
            <Box my={2} display="flex" alignItems={"center"}>
              <FastfoodIcon color="primary" className={landingStyles.teaserExplanationIconPadding} fontSize='large'/>
              <Paragraph i18n="landing:teaser_workflow_team_meals" />
            </Box>
            <Box my={2} display="flex" alignItems={"center"}>
              <EventSeatIcon fontSize='large' color='primary' className={landingStyles.teaserExplanationIconPadding}/>
              <Paragraph i18n="landing:teaser_workflow_team_host"></Paragraph>
            </Box>
            <Box my={2} display="flex" alignItems={"center"}>
              <EventSeatIcon fontSize='large' color='primary' className={landingStyles.teaserExplanationIconPadding}/>
              <Paragraph i18n="landing:teaser_workflow_team_guest"></Paragraph>
            </Box>
            <Box my={2} display={"flex"} alignItems={"center"}>
              <DirectionsRunIcon color='primary' className={landingStyles.teaserExplanationIconPadding} fontSize='large'/>
              <Paragraph i18n="landing:teaser_workflow_dinner_route" />
            </Box>
            <Box mt={2} display={"flex"} alignItems={"center"}>
              <LocalBarIcon color="primary" className={landingStyles.teaserExplanationIconPadding} fontSize='large'/>
              <Paragraph i18n="landing:teaser_workflow_dinner_route_finish" />
            </Box>
          </SpacingGrid>
          <SpacingGrid item xs={12} md={6}>
            <Typography variant={"h4"} component="h4" gutterBottom>{t("common:example")}</Typography>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_appetizer"></Paragraph>
            </Box>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_main_course" html={true}></Paragraph>
            </Box>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_dessert" html={true}></Paragraph>
            </Box>
            <Box mt={2}>
              <Paragraph i18n="landing:teaser_example_summary" html={true}></Paragraph>
            </Box>
          </SpacingGrid>
        </SpacingGrid>
      </div>

      <Container maxWidth="xl">
        <SpacingGrid container spacing={6} mt={2}>
        
          <SpacingGrid item xs={12} md={6} ref={columnRef}>
            <PageTitle>{t("for_organizers_headline")}</PageTitle>
            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:create_event_headline"}>
                <Span i18n={"landing:create_event_description"} html={true} />
                <SpacingGrid container justify='space-evenly' alignItems={imageAlignItems} py={2} spacing={imageSpacing} direction={imageRowDirection}>
                  <SpacingGrid item>
                    <Zoom><img src={wizardImg1} alt="Running Dinner Wizard with Basic Details" width={imageWidth} loading='lazy'/></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={wizardImg2} alt="Running Dinner Wizard with Option Settings" width={imageWidth} loading='lazy' /></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={dashboardImg} alt="Dashboard after Dinner Creation" width={imageWidth} loading='lazy' /></Zoom>
                  </SpacingGrid>
                </SpacingGrid>
                <Box pt={2}>
                  <PrimaryRouterButton to={LANDING_CREATE_RUNNING_DINNER_PATH}>{t('landing:create_event_headline')}</PrimaryRouterButton>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:manage_event_headline"}>
                <Span i18n={"landing:manage_event_description"} />
                <SpacingGrid container justify='space-evenly' alignItems={imageAlignItems} py={2} spacing={imageSpacing} direction={imageRowDirection}>
                  <SpacingGrid item>
                    <Zoom><img src={participantsImg} alt="Administration of Participants" width={imageWidth} loading='lazy' /></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={teamsImg} alt="Administration of Teams" width={imageWidth} loading='lazy' /></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={teamMailsImg} alt="Sending Mails" width={imageWidth} loading='lazy' /></Zoom>
                  </SpacingGrid>
                </SpacingGrid>
                <Box pt={2}>
                  <Button color={"primary"}
                          variant={"outlined"}
                          to={LANDING_CREATE_RUNNING_DINNER_PATH}
                          component={RouterLink}>{t('landing:manage_event_link')}</Button>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:manage_event_party_headline"}>
                <Span i18n={"landing:manage_event_party_description"}  html={true} />
              </TeaserCard>
            </Box>
          </SpacingGrid>


          <SpacingGrid item xs={12} md={6}>
            <PageTitle>{t("for_participants_headline")}</PageTitle>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:discover_public_events_headline"}>
                <Span i18n={"landing:discover_public_events_description"} />
                <SpacingGrid container justify='space-evenly' alignItems={imageAlignItems} py={2} spacing={imageSpacing} direction={imageRowDirection}>
                  <SpacingGrid item>
                    <Zoom><img src={registrationImg} alt="Dinner Registration" width={imageWidth} /></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={selfServiceImg} alt="Functionalities for self managing settings" width={imageWidth} /></Zoom>
                  </SpacingGrid>
                  <SpacingGrid item>
                    <Zoom><img src={dinnerRouteImg} alt="Live Dinner Route" width={imageWidth} /></Zoom>
                  </SpacingGrid>
                </SpacingGrid>
                <Box pt={2}>
                  <PrimaryRouterButton to={RUNNING_DINNER_EVENTS_PATH}>{t('landing:discover_public_events_link')}</PrimaryRouterButton>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:public_events_no_event_found_headline"}>
                <Span i18n={"landing:public_events_no_event_found_description"} html={true}/>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={"landing:privacy_question_headline"}>
                <Span i18n={"landing:privacy_question_description"} html={true}/>
                <Box pt={2}>
                  <Button color={"primary"}
                          variant={"outlined"}
                          to={"/impressum"}
                          component={RouterLink}>{t('landing:privacy_more_infos_link')}</Button>
                </Box>
              </TeaserCard>
            </Box>

          </SpacingGrid>

        </SpacingGrid>
      </Container>
    </div>
  );
}

