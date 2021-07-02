import React from "react";
import DashboardTitle from "./DashboardTitle"
import MealsList from "./MealsList"
import Overview from "./Overview";
import {Grid, Paper} from "@material-ui/core";
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

  return (
      <div>
        <div>
          <DashboardTitle basicDetails={basicDetails} />
        </div>
        <Grid container spacing={8} justify={"center"} alignItems={"stretch"}>
          <Grid item xs={12} md={3}>
            { dashboardAdminActivities && <MealsList meals={meals}
                                                     adminId={adminId}
                                                     onRunningDinnerUpdate={handleRunningDinnerUpdate}
                                                     dashboardAdminActivities={dashboardAdminActivities} /> }
          </Grid>
          <Grid item xs={12} md={3}>
            <Overview runningDinner={runningDinner} />
          </Grid>
          <Grid item xs={12} md={3}>
            { dashboardAdminActivities && <Checklist runningDinner={runningDinner} dashboardAdminActivities={dashboardAdminActivities} /> }
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} md={8}>
            { dashboardAdminActivities && <AdminActivitiesTimeline dashboardAdminActivities={dashboardAdminActivities} /> }
          </Grid>
          { !isClosedDinner(runningDinner) &&
              <Grid item xs={12} md={4}>
                <ParticipantRegistrations runningDinner={runningDinner} />
              </Grid> }
        </Grid>
        <Helmet>
          <title>Dashboard - Running Dinner Administration</title>
        </Helmet>
      </div>
  );
}
