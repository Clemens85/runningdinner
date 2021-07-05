import React from "react";
import DashboardTitle from "./DashboardTitle"
import MealsList from "./MealsList"
import Overview from "./Overview";
import {Box, Grid, Hidden} from "@material-ui/core";
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
import {SmallTitle} from "../../common/theme/typography/Tags";
import {HelpIconTooltip} from "../../common/theme/HelpIconTooltip";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import {PublicRunningDinnerLink} from "./PublicRunningDinnerLink";

export default function Dashboard({runningDinner}: BaseRunningDinnerProps) {

  const { basicDetails, adminId } = runningDinner;
  const { meals } = runningDinner.options;

  const dispatch = useDispatch();
  const {t} = useTranslation();

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
        { !isClosedDinner(runningDinner) &&
            <>
              <Hidden xsDown>
                <Grid container alignItems={"center"} spacing={1}>
                  <Grid item>
                    <SmallTitle>{t("common:hidden_link_text")}&nbsp;<PublicRunningDinnerLink {... runningDinner} /></SmallTitle>
                  </Grid>
                  <Grid item>
                    <HelpIconTooltip title={<Paragraph i18n={"admin:open_dinner_link_help"} fontSize={"small"} />} />
                  </Grid>
                </Grid>
              </Hidden>
              <Hidden smUp>
                <Grid container alignItems={"center"}>
                  <Grid item>
                    <Box pr={1}><SmallTitle i18n={"common:hidden_link_text"}/></Box>
                  </Grid>
                  <Grid item><HelpIconTooltip title={<Paragraph i18n={"admin:open_dinner_link_help"} fontSize={"small"} />} /></Grid>
                  <Grid item xs={12}><PublicRunningDinnerLink {... runningDinner} /></Grid>
                </Grid>
              </Hidden>
            </>
        }
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
