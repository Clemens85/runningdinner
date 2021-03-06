import React from "react";
import DashboardTitle from "./DashboardTitle"
import MealsList from "./MealsList"
import Overview from "./Overview";
import { Grid}  from "@material-ui/core";
import Checklist from "./Checklist";

export default function Dashboard(props) {

  const { runningDinner } = props;
  const { basicDetails, adminId } = runningDinner;
  const { meals } = runningDinner.options;

  return (
      <div>
        <div>
          <DashboardTitle basicDetails={basicDetails}></DashboardTitle>
        </div>
        <Grid container spacing={8} justify={"center"} alignItems={"stretch"}>
          <Grid item xs={12} md={3}>
            <MealsList meals={meals} adminId={adminId} {...props}></MealsList>
          </Grid>
          <Grid item xs={12} md={3}>
            <Overview runningDinner={runningDinner}></Overview>
          </Grid>
          <Grid item xs={12} md={3}>
            <Checklist></Checklist>
          </Grid>
        </Grid>
      </div>
  );
}
