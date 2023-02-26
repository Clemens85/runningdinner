import React from 'react';
import DinnerRouteView from "../common/dinnerroute/DinnerRouteView";
import {useParams} from "react-router-dom";
import {
  fetchSelfAdminDinnerRoute,
  getSelfAdminDinnerRouteFetchSelector,
  useSelfAdminDispatch,
  useSelfAdminSelector
} from "@runningdinner/shared";

export default function SelfAdminDinnerRoutePage() {

  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || "";
  const participantId = urlParams.participantId || "";
  const teamId = urlParams.teamId || "";

  const dispatch = useSelfAdminDispatch();

  const {data: dinnerRoute} = useSelfAdminSelector(getSelfAdminDinnerRouteFetchSelector);

  React.useEffect(() => {
    dispatch(fetchSelfAdminDinnerRoute({selfAdminId, participantId, teamId}));
  }, [dispatch, selfAdminId, participantId, teamId]);

  if (!dinnerRoute) {
    return null;
  }
  return <DinnerRouteView dinnerRoute={dinnerRoute} />;
}