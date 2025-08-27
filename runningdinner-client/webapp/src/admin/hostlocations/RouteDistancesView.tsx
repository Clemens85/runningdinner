import { LinearProgress, Grid, Tooltip, Chip, Typography, styled, Divider } from '@mui/material';
import { Box } from '@mui/system';
import {
  useDinnerRouteOverviewContext,
  DinnerRouteTeamWithDistance,
  DinnerRouteMapCalculator,
  DinnerRouteOverviewActionType,
  TeamStatus,
  DinnerRouteDistanceUtil,
  isDefined,
  BaseAdminIdProps,
  DinnerRouteWithDistancesList,
} from '@runningdinner/shared';
import React, { useEffect } from 'react';
import { getTeamLabel } from '../../common/dinnerroute';
import { CancelledTeamMember } from '../teams/CancelledTeamMember';
import { useZoomToMarker } from './useZoomToMarker';
import { useCalculateRouteDistances } from './useCalculateRouteDistances';

type RouteDistancesViewProps = {
  routeDistancesList: DinnerRouteWithDistancesList | undefined;
};

const HrGreenLine = styled('hr')(({ theme }) => ({
  marginTop: '-3px',
  borderColor: theme.palette.primary.light,
  width: '130%',
}));
const HrRedLine = styled('hr')(({ theme }) => ({
  marginTop: '-3px',
  borderColor: theme.palette.secondary.light,
  width: '130%',
}));

function RouteDistancesSummary({ routeDistancesList }: RouteDistancesViewProps) {
  if (!routeDistancesList) {
    return null;
  }

  return (
    <Box>
      <div>
        <span>&#8960; Durschnitts-Distanz pro Team:</span> <strong>{DinnerRouteDistanceUtil.getDistancePrettyFormatted(routeDistancesList.averageDistanceInMeters)}</strong>
      </div>
      <div>
        <span>&#8721; Summe aller Weg-Distanzen:</span> <strong>{DinnerRouteDistanceUtil.getDistancePrettyFormatted(routeDistancesList.sumDistanceInMeters)}</strong>
      </div>
    </Box>
  );
}

export function RouteDistancesView({ adminId }: BaseAdminIdProps) {
  const { data: routeDistancesList } = useCalculateRouteDistances(adminId);
  return <RouteDistancesControls routeDistancesList={routeDistancesList} />;
}

export function RouteDistancesControls({ routeDistancesList }: RouteDistancesViewProps) {
  const { handleZoomTo } = useZoomToMarker();
  const { dispatch } = useDinnerRouteOverviewContext();

  function handleClick(team: DinnerRouteTeamWithDistance) {
    const geocodingResult = DinnerRouteMapCalculator.getGeocodingResult(team);
    handleZoomTo(geocodingResult);
    dispatch({
      type: DinnerRouteOverviewActionType.SCROLL_TO_TEAM,
      payload: team.teamNumber,
    });
  }

  useEffect(() => {
    if (!routeDistancesList) {
      return;
    }
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_ROUTE_DISTANCE_METRICS,
      payload: { averageDistanceInMeters: routeDistancesList.averageDistanceInMeters, sumDistanceInMeters: routeDistancesList.sumDistanceInMeters },
    });
  }, [routeDistancesList, dispatch]);

  if (!routeDistancesList || !routeDistancesList.dinnerRoutes) {
    return <LinearProgress variant="determinate" />;
  }

  const routeDistances = routeDistancesList.dinnerRoutes;

  return (
    <Box>
      <RouteDistancesSummary routeDistancesList={routeDistancesList} />

      <Divider sx={{ my: 2 }}>Entfernungen pro Team</Divider>

      {routeDistances.map((routeDistance, index) => (
        <Box pr={1} sx={{ borderBottom: '1px dotted' }} key={index}>
          <Grid container justifyContent="space-between" alignItems={'center'}>
            {routeDistance.teams.map((team, index) => (
              <React.Fragment key={index}>
                <Grid item sx={{ my: 2 }}>
                  {team.status === TeamStatus.CANCELLED && <CancelledTeamMember />}
                  {team.status !== TeamStatus.CANCELLED && team.currentTeam && (
                    <Tooltip
                      title={
                        <>
                          {getTeamLabel(team, true)}
                          <br />
                          &#8960; {DinnerRouteDistanceUtil.getDistancePrettyFormatted(routeDistance.averageDistanceInMeters)}
                        </>
                      }
                      placement="top-end"
                    >
                      <Chip label={`Team ${team.teamNumber}`} color={'primary'} variant={'filled'} onClick={() => handleClick(team)} />
                    </Tooltip>
                  )}
                  {team.status !== TeamStatus.CANCELLED && !team.currentTeam && (
                    <Tooltip title={getTeamLabel(team, true)} placement="top-end">
                      <Chip label={`Team ${team.teamNumber}`} color={'default'} variant={'outlined'} />
                    </Tooltip>
                  )}
                </Grid>
                {isDefined(team.distanceToNextTeam) && (
                  <Grid>
                    <Typography variant="body2" color={team.largestDistanceInRoute ? 'secondary' : 'primary'}>
                      {Math.round(team.distanceToNextTeam)} km
                    </Typography>
                    {team.largestDistanceInRoute ? <HrRedLine /> : <HrGreenLine />}
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
