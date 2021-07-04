import React from "react";
import DashboardTitle from "./DashboardTitle"
import MealsList from "./MealsList"
import Overview from "./Overview";
import {Box, Grid, Paper} from "@material-ui/core";
import Checklist from "./Checklist";
import {
  BaseRunningDinnerProps,
  fetchAdminActivities,
  getAdminActivitiesFetchSelector,
  isClosedDinner,
  RunningDinner,
  setUpdatedRunningDinner,
  useAdminSelector,
} from "@runningdinner/shared";
import {Helmet} from "react-helmet-async";
import {useDispatch} from "react-redux";
import {AdminActivitiesTimeline} from "./AdminActivitiesTimeline";
import {ParticipantRegistrations} from "./ParticipantRegistrations";

export default function Dashboard({runningDinner}: BaseRunningDinnerProps) {

  const { basicDetails, adminId } = runningDinner;
  const { meals } = runningDinner.options;

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchAdminActivities(adminId));
  }, [dispatch, adminId]);

  const {data: dashboardAdminActivities} = useAdminSelector(getAdminActivitiesFetchSelector);

  function handleRunningDinnerUpdate(updatedRunningDinner: RunningDinner) {
    dispatch(fetchAdminActivities(adminId));
    dispatch(setUpdatedRunningDinner(updatedRunningDinner));
  }

  // const padding = 2;
  const padding = {
    pr: 2,
    pt: 2,
    pb: 2
  }

  return (
      <div>
        <div>
          <DashboardTitle basicDetails={basicDetails} />
        </div>
        <Grid container justify={"center"} alignItems={"stretch"}>
          <Grid item xs={12} md={4}>
            <Box {...padding}>
              <Overview runningDinner={runningDinner} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box {...padding}>
              { dashboardAdminActivities && <MealsList meals={meals}
                                                       adminId={adminId}
                                                       onRunningDinnerUpdate={handleRunningDinnerUpdate}
                                                       dashboardAdminActivities={dashboardAdminActivities} /> }
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box {...padding} pr={0}>
              { dashboardAdminActivities && <Checklist runningDinner={runningDinner} dashboardAdminActivities={dashboardAdminActivities} /> }
            </Box>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} md={8}>
            <Box {...padding}>
              { dashboardAdminActivities && <AdminActivitiesTimeline dashboardAdminActivities={dashboardAdminActivities} /> }
            </Box>
          </Grid>
          { !isClosedDinner(runningDinner) &&
               <Grid item xs={12} md={4}>
                 <Box {...padding} pr={0}>
                    <ParticipantRegistrations runningDinner={runningDinner} />
                 </Box>
              </Grid> }
        </Grid>
        <Helmet>
          <title>Dashboard - Running Dinner Administration</title>
        </Helmet>
      </div>
  );
}
