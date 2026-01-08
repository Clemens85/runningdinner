import 'react-medium-image-zoom/dist/styles.css';

import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import GroupIcon from '@mui/icons-material/Group';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import { Box, Container, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import { Link as RouterLink } from 'react-router-dom';

import useElementSize from '../common/hooks/ElementSizeHook';
import { IMPRESSUM_PATH, LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import { PrimaryRouterButton } from '../common/theme/PrimaryButton';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle, Span } from '../common/theme/typography/Tags';
import dashboardImg from './images/dashboard.png';
import dinnerRouteImg from './images/dinner-route.png';
import participantsImg from './images/participants.png';
import registrationImg from './images/registration.png';
import selfServiceImg from './images/selfservice-team-host.png';
import teamMailsImg from './images/team-mails.png';
import teamsImg from './images/teams.png';
import wizardImg1 from './images/wizard1.png';
import wizardImg2 from './images/wizard2.png';
import { ExplanationBox } from './LandingStyles';
import { TeaserCard } from './TeaserCard';

export function LandingStart() {
  const { t } = useTranslation(['landing', 'common']);

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  const [imageWidth, setImageWidth] = React.useState(250);

  const [columnRef, { width: columnWidth }] = useElementSize();
  React.useEffect(() => {
    const columnWidthMinusSpacing = columnWidth - 128;
    const divisor = isMobileDevice ? 1 : 3;
    const calculatedWidthPerImage = columnWidthMinusSpacing / divisor;
    setImageWidth(calculatedWidthPerImage <= 0 ? 250 : calculatedWidthPerImage);
  }, [columnWidth, isMobileDevice]);

  const mbTeaser = 6;

  const imageRowDirection = isMobileDevice ? 'column' : 'row';
  const imageSpacing = isMobileDevice ? 3 : 1;
  const imageAlignItems = isMobileDevice ? 'center' : 'baseline';

  return (
    <div>
      <Container maxWidth={false}>
        <Grid container sx={{ mt: 6, mb: 4 }}>
          <Grid size={12}>
            <Typography variant={'h4'} component="h4" color="textPrimary">
              {t('landing:teaser_how_does_it_work')}
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <ExplanationBox>
        <Grid container sx={{ mt: 2, mb: 4 }} justifyContent="center" spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Box my={2} display="flex" alignItems={'center'}>
              <GroupIcon color="primary" sx={{ mr: 2 }} fontSize="large" />
              <Paragraph i18n="landing:teaser_workflow_team_generation" />
            </Box>
            <Box my={2} display="flex" alignItems={'center'}>
              <FastfoodIcon color="primary" sx={{ mr: 2 }} fontSize="large" />
              <Paragraph i18n="landing:teaser_workflow_team_meals" />
            </Box>
            <Box my={2} display="flex" alignItems={'center'}>
              <EventSeatIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Paragraph i18n="landing:teaser_workflow_team_host" />
            </Box>
            <Box my={2} display="flex" alignItems={'center'}>
              <EventSeatIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Paragraph i18n="landing:teaser_workflow_team_guest" />
            </Box>
            <Box my={2} display={'flex'} alignItems={'center'}>
              <DirectionsRunIcon color="primary" sx={{ mr: 2 }} fontSize="large" />
              <Paragraph i18n="landing:teaser_workflow_dinner_route" />
            </Box>
            <Box mt={2} display={'flex'} alignItems={'center'}>
              <LocalBarIcon color="primary" sx={{ mr: 2 }} fontSize="large" />
              <Paragraph i18n="landing:teaser_workflow_dinner_route_finish" />
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Typography variant={'h4'} component="h4" gutterBottom>
              {t('common:example')}
            </Typography>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_appetizer" />
            </Box>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_main_course" html={true} />
            </Box>
            <Box my={2}>
              <Paragraph i18n="landing:teaser_example_dessert" html={true} />
            </Box>
            <Box mt={2}>
              <Paragraph i18n="landing:teaser_example_summary" html={true} />
            </Box>
          </Grid>
        </Grid>
      </ExplanationBox>
      <Container maxWidth={false}>
        <Grid container spacing={6} sx={{ mt: 2 }}>
          <Grid
            ref={columnRef}
            size={{
              xs: 12,
              md: 6
            }}>
            <PageTitle>{t('for_organizers_headline')}</PageTitle>
            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:create_event_headline'}>
                <Span i18n={'landing:create_event_description'} html={true} />
                <Grid container justifyContent="space-evenly" alignItems={imageAlignItems} sx={{ py: 2 }} spacing={imageSpacing} direction={imageRowDirection}>
                  <Grid>
                    <Zoom>
                      <img src={wizardImg1} alt="Running Dinner Wizard with Basic Details" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={wizardImg2} alt="Running Dinner Wizard with Option Settings" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={dashboardImg} alt="Dashboard after Dinner Creation" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                </Grid>
                <Box pt={2}>
                  <PrimaryRouterButton to={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`}>{t('landing:create_event_headline')}</PrimaryRouterButton>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:manage_event_headline'}>
                <Span i18n={'landing:manage_event_description'} />
                <Grid container justifyContent="space-evenly" alignItems={imageAlignItems} sx={{ py: 2 }} spacing={imageSpacing} direction={imageRowDirection}>
                  <Grid>
                    <Zoom>
                      <img src={participantsImg} alt="Administration of Participants" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={teamsImg} alt="Administration of Teams" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={teamMailsImg} alt="Sending Mails" width={imageWidth} loading="lazy" />
                    </Zoom>
                  </Grid>
                </Grid>
                <Box pt={2}>
                  <Button color={'primary'} variant={'outlined'} to={`/${LANDING_CREATE_RUNNING_DINNER_PATH}`} component={RouterLink}>
                    {t('landing:manage_event_link')}
                  </Button>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:manage_event_party_headline'}>
                <Span i18n={'landing:manage_event_party_description'} html={true} />
              </TeaserCard>
            </Box>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <PageTitle>{t('for_participants_headline')}</PageTitle>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:discover_public_events_headline'}>
                <Span i18n={'landing:discover_public_events_description'} />
                <Grid container justifyContent="space-evenly" alignItems={imageAlignItems} sx={{ py: 2 }} spacing={imageSpacing} direction={imageRowDirection}>
                  <Grid>
                    <Zoom>
                      <img src={registrationImg} alt="Dinner Registration" width={imageWidth} />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={selfServiceImg} alt="Functionalities for self managing settings" width={imageWidth} />
                    </Zoom>
                  </Grid>
                  <Grid>
                    <Zoom>
                      <img src={dinnerRouteImg} alt="Live Dinner Route" width={imageWidth} />
                    </Zoom>
                  </Grid>
                </Grid>
                <Box pt={2}>
                  <PrimaryRouterButton to={`/${RUNNING_DINNER_EVENTS_PATH}`}>{t('landing:discover_public_events_link')}</PrimaryRouterButton>
                </Box>
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:public_events_no_event_found_headline'}>
                <Span i18n={'landing:public_events_no_event_found_description'} html={true} />
              </TeaserCard>
            </Box>

            <Box mb={mbTeaser}>
              <TeaserCard titleI18nKey={'landing:privacy_question_headline'}>
                <Span i18n={'landing:privacy_question_description'} html={true} />
                <Box pt={2}>
                  <Button color={'primary'} variant={'outlined'} to={`/${IMPRESSUM_PATH}`} component={RouterLink}>
                    {t('landing:privacy_more_infos_link')}
                  </Button>
                </Box>
              </TeaserCard>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
