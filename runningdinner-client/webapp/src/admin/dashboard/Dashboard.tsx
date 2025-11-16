import DashboardTitle from './DashboardTitle';
import MealsList from './MealsList';
import Overview from './Overview';
import { Box, Grid, useMediaQuery } from '@mui/material';
import Checklist from './Checklist';
import {
  assertDefined,
  BaseRunningDinnerProps,
  isClosedDinner,
  isQuerySucceeded,
  RunningDinner,
  setUpdatedRunningDinner,
  useFindAdminActivitiesByAdminId,
} from '@runningdinner/shared';
import { SuperSEO } from 'react-super-seo';
import { useDispatch } from 'react-redux';
import { AdminActivitiesTimeline } from './AdminActivitiesTimeline';
import { ParticipantRegistrations } from './ParticipantRegistrations';
import { SmallTitle } from '../../common/theme/typography/Tags';
import { HelpIconTooltip } from '../../common/theme/HelpIconTooltip';
import Paragraph from '../../common/theme/typography/Paragraph';
import { useTranslation } from 'react-i18next';
import { PublicRunningDinnerLink } from './PublicRunningDinnerLink';
import { Theme } from '@mui/material/styles';
import { FetchProgressBar } from '../../common/FetchProgressBar';

export default function Dashboard({ runningDinner }: BaseRunningDinnerProps) {
  const { basicDetails, adminId } = runningDinner;
  const { meals } = runningDinner.options;

  const smUpDevice = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const findAdminActivitiesQuery = useFindAdminActivitiesByAdminId(adminId);
  if (!isQuerySucceeded(findAdminActivitiesQuery)) {
    return <FetchProgressBar {...findAdminActivitiesQuery} />;
  }
  const { data: dashboardAdminActivities, refetch } = findAdminActivitiesQuery;
  assertDefined(dashboardAdminActivities);

  function handleRunningDinnerUpdate(updatedRunningDinner: RunningDinner) {
    refetch();
    dispatch(setUpdatedRunningDinner(updatedRunningDinner));
  }

  // const padding = 2;
  const padding = {
    pr: 2,
    pt: 2,
    pb: 2,
  };

  return (
    <div>
      <div>
        <DashboardTitle basicDetails={basicDetails} />
      </div>
      {!isClosedDinner(runningDinner) && (
        <>
          {smUpDevice && (
            <Grid container alignItems={'center'} spacing={1}>
              <Grid item>
                <SmallTitle>
                  {t('common:hidden_link_text')}&nbsp;
                  <PublicRunningDinnerLink {...runningDinner} />
                </SmallTitle>
              </Grid>
              <Grid item>
                <HelpIconTooltip title={<Paragraph i18n={'admin:open_dinner_link_help'} fontSize={'small'} />} />
              </Grid>
            </Grid>
          )}
          {!smUpDevice && (
            <Grid container alignItems={'center'}>
              <Grid item>
                <Box pr={1}>
                  <SmallTitle i18n={'common:hidden_link_text'} />
                </Box>
              </Grid>
              <Grid item>
                <HelpIconTooltip title={<Paragraph i18n={'admin:open_dinner_link_help'} fontSize={'small'} />} />
              </Grid>
              <Grid item xs={12}>
                <PublicRunningDinnerLink {...runningDinner} />
              </Grid>
            </Grid>
          )}
        </>
      )}
      <Grid container justifyContent={'center'} alignItems={'stretch'}>
        <Grid item xs={12} md={4}>
          <Box {...padding}>
            <Overview runningDinner={runningDinner} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box {...padding}>
            {dashboardAdminActivities && (
              <MealsList meals={meals} runningDinner={runningDinner} onRunningDinnerUpdate={handleRunningDinnerUpdate} dashboardAdminActivities={dashboardAdminActivities} />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box {...padding} pr={0}>
            {dashboardAdminActivities && <Checklist runningDinner={runningDinner} dashboardAdminActivities={dashboardAdminActivities} />}
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} md={8}>
          <Box {...padding}>{dashboardAdminActivities && <AdminActivitiesTimeline dashboardAdminActivities={dashboardAdminActivities} />}</Box>
        </Grid>
        {!isClosedDinner(runningDinner) && (
          <Grid item xs={12} md={4}>
            <Box {...padding} pr={0}>
              <ParticipantRegistrations runningDinner={runningDinner} />
            </Box>
          </Grid>
        )}
      </Grid>
      <SuperSEO title={'Dashboard - Running Dinner Administration'} />
    </div>
  );
}
