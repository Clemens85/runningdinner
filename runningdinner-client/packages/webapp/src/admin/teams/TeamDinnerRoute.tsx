import React from 'react';
import {useAdminContext} from "../AdminContext";
import {Fetch} from "../../common/Fetch";
import {findDinnerRouteByAdminIdAndTeamIdAsync} from "@runningdinner/shared";
import {useParams} from "react-router-dom";
import DinnerRouteView from "../../common/dinnerroute/DinnerRouteView";

export default function TeamDinnerRoute() {

  const {runningDinner} = useAdminContext();
  const {adminId} = runningDinner;

  const params = useParams<Record<string, string>>();
  const teamId = params.teamId;

  return (
      <Fetch asyncFunction={findDinnerRouteByAdminIdAndTeamIdAsync}
             parameters={[adminId, teamId]}
             render={resultWrapper => <DinnerRouteView dinnerRoute={resultWrapper.result} />} />
  );
}
