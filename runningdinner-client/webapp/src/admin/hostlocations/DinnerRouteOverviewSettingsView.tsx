import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  styled,
  Switch,
  SxProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { TitleBar } from './TitleBar';
import { Trans, useTranslation } from 'react-i18next';
import {
  DinnerRouteOverviewActionType,
  useDinnerRouteOverviewContext,
  Time,
  isSameEntity,
  ALL_MEALS_OPTION,
  isDefined,
  DinnerRouteWithDistances,
  TeamStatus,
  MealFilterOption,
  DinnerRouteMapData,
  DinnerRouteTeamWithDistance,
  isStringNotEmpty,
  DinnerRouteDistanceUtil,
  TeamNeighbourCluster,
  Team,
  DinnerRouteMapCalculator,
} from '@runningdinner/shared';
import { SmallTitle, Span } from '../../common/theme/typography/Tags';
import { BaseAdminIdProps } from '@runningdinner/shared';
import { useState } from 'react';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { Virtuoso } from 'react-virtuoso';
import React from 'react';
import { CancelledTeamMember } from '../teams/CancelledTeamMember';
import { getTeamLabel, WarningAlert } from '../../common/dinnerroute';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { ProgressBar } from '../../common/ProgressBar';
import { useZoomToMarker } from './useZoomToMarker';
import { Stack } from '@mui/system';
import { RouteOptimizationButton } from './RouteOptimizationButton';
import { useCalculateTeamNeighbourClusters } from './useCalculateTeamNeighbourClusters';
import { useCalculateRouteDistances } from './useCalculateRouteDistances';
import { useIsRouteOptimization } from './useIsRouteOptimization';

type DinnerRouteOverviewSettingsViewProps = {
  dinnerRouteMapData: DinnerRouteMapData;
} & BaseAdminIdProps;

export function DinnerRouteOverviewSettingsView({ adminId, dinnerRouteMapData }: DinnerRouteOverviewSettingsViewProps) {
  const { t } = useTranslation(['common', 'admin']);
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { mealFilterOptions, mealFilter, afterPartyLocation } = state;

  const { teamsWithUnresolvedGeocodings } = dinnerRouteMapData;

  const [distanceRange, setDistanceRange] = useState(0);
  const [showRouteDistances, setShowRouteDistances] = useState(false);

  const { data: teamNeighbourClusters, isPending: teamNeighbourClustersLoading } = useCalculateTeamNeighbourClusters(adminId, distanceRange);

  const { data: routeDistancesList } = useCalculateRouteDistances(adminId);

  const isMobileDevice = useIsMobileDevice();

  const optimizationId = useIsRouteOptimization();

  const settingsPaperStyles: SxProps = {
    top: 80,
    left: isMobileDevice ? 0 : 40,
    position: 'fixed',
    minWidth: 300,
    maxWidth: isMobileDevice ? 360 : 480,
    zIndex: 10,
  };

  function handleMinimizeView() {
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_SETTINGS_VIEW_MINIMIZED,
      payload: true,
    });
  }

  function handleMealFilterChange(mealId: string) {
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_MEAL_FILTER,
      payload: mealId,
    });
  }

  function renderMealFilterOption(mealFilterOption: MealFilterOption) {
    if (isSameEntity(mealFilterOption, ALL_MEALS_OPTION)) {
      return <Trans i18nKey={'common:all'} />;
    }
    if (isDefined(mealFilterOption.toMeal)) {
      return (
        <>
          {mealFilterOption.fromMeal?.label} &nbsp;=&gt;&nbsp; <strong>{mealFilterOption.toMeal.label}</strong>
        </>
      );
    }
    if (!isSameEntity(mealFilterOption, ALL_MEALS_OPTION) && !isDefined(mealFilterOption.toMeal)) {
      return (
        <>
          <strong>{mealFilterOption.fromMeal?.label}</strong> &nbsp;=&gt;&nbsp; {afterPartyLocation?.title}
        </>
      );
    }
  }

  const filterMealsLabel = t('admin:dinner_route_filter_meal_routes_label');

  return (
    <>
      <Paper id="dinnerRouteOverviewSettings" sx={settingsPaperStyles} elevation={3}>
        <TitleBar
          onToggleMinize={handleMinimizeView}
          title={t('common:settings')}
          actionButtton={<RouteOptimizationButton adminId={adminId} routeDistancesList={routeDistancesList} />}
        />

        <Box p={2}>
          <WarningAlert teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} />

          <Box>
            <SmallTitle>{t('admin:dinner_route_hosts_near_distance')}</SmallTitle>
            <Box px={2}>
              <Slider
                aria-label={t('common:distance')}
                value={distanceRange}
                onChange={(_evt, newValue) => setDistanceRange(newValue as number)}
                disabled={isStringNotEmpty(optimizationId)}
                getAriaValueText={() => `${distanceRange} m`}
                step={50}
                marks={[
                  { value: 0, label: '0 m' },
                  { value: 250, label: '250 m' },
                  { value: 500, label: '500 m' },
                  { value: 750, label: '750 m' },
                  { value: 1000, label: '1 km' },
                ]}
                min={0}
                valueLabelDisplay="auto"
                max={1000}
              />
            </Box>
          </Box>
          <Box>
            {!teamNeighbourClusters && <TeamNeighbourClustersLoadingView />}
            {teamNeighbourClusters && (
              <TeamNeighbourClusterView teamNeighbourClusters={teamNeighbourClusters} loading={teamNeighbourClustersLoading} distanceRange={distanceRange} />
            )}
          </Box>

          <Divider sx={{ mb: 4, mt: 4 }} />

          <Box>
            <SmallTitle>{t('admin:dinner_route_filter_meal_routes_title')}</SmallTitle>
            <FormControl variant="outlined" sx={{ mt: 1, minWidth: isMobileDevice ? '340px' : '400px' }} size="small">
              <InputLabel>{filterMealsLabel}</InputLabel>
              <Select
                variant="outlined"
                label={filterMealsLabel}
                autoWidth
                value={mealFilter?.id}
                size="small"
                onChange={(evt: SelectChangeEvent) => handleMealFilterChange(evt.target.value)}
                inputProps={{ 'aria-label': filterMealsLabel }}
              >
                {mealFilterOptions.map((mealFilterOption) => (
                  <MenuItem value={mealFilterOption.id} key={mealFilterOption.id}>
                    {renderMealFilterOption(mealFilterOption)}
                  </MenuItem>
                ))}
              </Select>
              {!isSameEntity(mealFilter, ALL_MEALS_OPTION) && (
                <FormHelperText>
                  {isDefined(mealFilter.toMeal) ? (
                    <Trans i18nKey={'admin:dinner_route_filter_from_meal_to_meal_help'} values={{ from: mealFilter.fromMeal?.label, to: mealFilter.toMeal?.label }} />
                  ) : (
                    <Trans i18nKey={'admin:dinner_route_filter_from_meal_to_afterlocation_help'} values={{ from: mealFilter.fromMeal?.label, to: afterPartyLocation?.title }} />
                  )}
                </FormHelperText>
              )}
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3, mt: 4 }} />

          <Box>
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              <FormGroup>
                <FormControlLabel
                  control={<Switch onChange={(evt) => setShowRouteDistances(evt.target.checked)} checked={showRouteDistances} />}
                  label={t('admin:dinner_route_distances_show')}
                />
              </FormGroup>
              {showRouteDistances && routeDistancesList && (
                <Box>
                  <span>
                    <strong>&#8960;</strong> {DinnerRouteDistanceUtil.getDistancePrettyFormatted(routeDistancesList.averageDistanceInMeters)}
                  </span>
                  <span>
                    &nbsp;&nbsp;<strong>&#8721;</strong> {DinnerRouteDistanceUtil.getDistancePrettyFormatted(routeDistancesList.sumDistanceInMeters)}
                  </span>
                </Box>
              )}
            </Stack>
            {showRouteDistances && <RouteDistancesView routeDistances={routeDistancesList?.dinnerRoutes} />}
          </Box>
        </Box>
      </Paper>
    </>
  );
}

type RouteDistancesViewProps = {
  routeDistances: DinnerRouteWithDistances[] | undefined;
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

function RouteDistancesView({ routeDistances }: RouteDistancesViewProps) {
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

  if (!routeDistances) {
    return <LinearProgress variant="determinate" />;
  }

  return (
    <Box sx={{ height: '380px' }}>
      <Virtuoso
        data={routeDistances}
        itemContent={(_, routeDistance) => (
          <>
            <Box pr={1} sx={{ borderBottom: '1px dotted' }}>
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
          </>
        )}
      ></Virtuoso>
    </Box>
  );
}

function TeamNeighbourClustersLoadingView() {
  const { t } = useTranslation('common');

  return (
    <Grid container alignItems="center" sx={{ my: 2 }}>
      <Grid item>
        <CircularProgress size={20} />
      </Grid>
      <Grid item>
        <Box sx={{ ml: 2 }}>
          <small>{t('common:loading')}</small>
        </Box>
      </Grid>
    </Grid>
  );
}

type TeamNeighbourClusterViewProps = {
  teamNeighbourClusters: TeamNeighbourCluster[];
  distanceRange: number;
  loading?: boolean;
};
function TeamNeighbourClusterView({ teamNeighbourClusters, distanceRange, loading }: TeamNeighbourClusterViewProps) {
  const { t } = useTranslation('admin');

  const isMobileDevice = useIsMobileDevice();

  if (teamNeighbourClusters.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        <small>{t('admin:dinner_route_hosts_near_distance_not_found', { distanceRange })}</small>
      </Box>
    );
  }

  let heightInPx = 100;
  if (!isMobileDevice && teamNeighbourClusters.length > 2) {
    heightInPx = 200;
  }

  return (
    <>
      <ProgressBar showLoadingProgress={!!loading} />
      <Box sx={{ height: `${heightInPx}px` }}>
        <Virtuoso
          data={teamNeighbourClusters}
          itemContent={(_, cluster) => (
            <Box sx={{ my: 2 }}>
              <SingleTeamNeighbourClusterView {...cluster} />
            </Box>
          )}
        ></Virtuoso>
      </Box>
    </>
  );
}

function SingleTeamNeighbourClusterView({ a, b, distance }: TeamNeighbourCluster) {
  return (
    <Grid container justifyContent="space-between" alignItems={'center'}>
      <Grid item>
        <TeamNeighbourClusterItem {...a} />
      </Grid>
      <Grid item>
        <Box>
          <center>{Math.round(distance)} m</center>
        </Box>
      </Grid>
      <Grid item>
        <TeamNeighbourClusterItem {...b} />
      </Grid>
    </Grid>
  );
}

function TeamNeighbourClusterItem(team: Team) {
  const { t } = useTranslation('common');

  const isMobileDevice = useIsMobileDevice();
  const { handleZoomTo } = useZoomToMarker();
  const { dispatch } = useDinnerRouteOverviewContext();

  function handleClick() {
    handleZoomTo(team.hostTeamMember.geocodingResult);
    dispatch({
      type: DinnerRouteOverviewActionType.SCROLL_TO_TEAM,
      payload: team.teamNumber,
    });
  }

  const teamColor = DinnerRouteMapCalculator.calculateTeamColor(team);

  return (
    <Box onClick={handleClick} sx={{ color: teamColor, margin: '0 auto', border: '2px solid', borderRadius: '8px', borderColor: teamColor, padding: '4px', cursor: 'pointer' }}>
      <Span>
        Team #{team.teamNumber}{' '}
        {!isMobileDevice && (
          <>
            {t('common:at_time')} <Time date={team.meal.time} />
          </>
        )}
        {isMobileDevice && (
          <>
            <br />
            <Time date={team.meal.time} />
          </>
        )}
      </Span>
      <Span>{team.meal.label}</Span>
    </Box>
  );
}

const MinimizedFab = styled(Fab)({
  margin: 0,
  top: 'auto',
  bottom: 40,
  right: 'autp',
  minWidth: 100,
  position: 'fixed',
  zIndex: 1,
});

export function DinnerRouteOverviewSettingsMinimizedButton() {
  const { dispatch } = useDinnerRouteOverviewContext();
  const { t } = useTranslation('common');

  const isMobileDevice = useIsMobileDevice();

  function handleMaximizeView() {
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_SETTINGS_VIEW_MINIMIZED,
      payload: false,
    });
  }

  return (
    <MinimizedFab variant="extended" color="primary" onClick={handleMaximizeView} sx={{ left: isMobileDevice ? 0 : 40 }}>
      {t('common:settings')}
      <OpenInFullRoundedIcon sx={{ ml: 1 }} />
    </MinimizedFab>
  );
}

// const GridWithLine = styled(Grid)( {
//   position: 'relative',
//   padding: "0 10px",
//   '&:before': {
//     content: '""',
//     position: "absolute",
//     top: "50%",
//     left: 0,
//     right: 0,
//     height: "1px",
//     backgroundColor: "#000",
//     transform: "translateY(-50%)",
//     zIndex: -1
//   }
// });
