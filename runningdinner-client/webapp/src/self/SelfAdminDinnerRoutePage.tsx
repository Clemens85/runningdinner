import { fetchSelfAdminDinnerRoute, getMealsOfDinnerSelfAdmin, getSelfAdminDinnerRouteFetchSelector, useSelfAdminDispatch, useSelfAdminSelector } from '@runningdinner/shared';
import React from 'react';
import { useParams } from 'react-router-dom';

import DinnerRouteView from '../common/dinnerroute/DinnerRouteView';

export default function SelfAdminDinnerRoutePage() {
  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';
  const teamId = urlParams.teamId || '';

  const dispatch = useSelfAdminDispatch();

  const { data: dinnerRoute } = useSelfAdminSelector(getSelfAdminDinnerRouteFetchSelector);
  const meals = useSelfAdminSelector(getMealsOfDinnerSelfAdmin);

  React.useEffect(() => {
    dispatch(fetchSelfAdminDinnerRoute({ selfAdminId, participantId, teamId }));
  }, [dispatch, selfAdminId, participantId, teamId]);

  if (!dinnerRoute || meals?.length === 0) {
    return null;
  }
  return <DinnerRouteView dinnerRoute={dinnerRoute} meals={meals} />;
}
