import { CircularProgress, Divider, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Slider } from '@mui/material';
import { Box } from '@mui/system';
import {
  ALL_MEALS_OPTION,
  BaseAdminIdProps,
  DinnerRouteMapCalculator,
  DinnerRouteOverviewActionType,
  isDefined,
  isSameEntity,
  isStringNotEmpty,
  MealFilterOption,
  Team,
  TeamNeighbourCluster,
  Time,
  useDinnerRouteOverviewContext,
} from '@runningdinner/shared';
import { t } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';

import { ProgressBar } from '../../common/ProgressBar';
import { useIsMobileDevice } from '../../common/theme/CustomMediaQueryHook';
import { SmallTitle, Span } from '../../common/theme/typography/Tags';
import { useCalculateTeamNeighbourClusters } from './useCalculateTeamNeighbourClusters';
import { useIsRouteOptimization } from './useIsRouteOptimization';
import { useZoomToMarker } from './useZoomToMarker';

function TeamNeighbourClustersLoadingView() {
  const { t } = useTranslation('common');

  return (
    <Grid container alignItems="center" sx={{ my: 2 }}>
      <Grid>
        <CircularProgress size={20} />
      </Grid>
      <Grid>
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
      <Grid>
        <TeamNeighbourClusterItem {...a} />
      </Grid>
      <Grid>
        <Box>
          <center>{Math.round(distance)} m</center>
        </Box>
      </Grid>
      <Grid>
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

export function NearbyHostsAnalysis({ adminId }: BaseAdminIdProps) {
  const [distanceRange, setDistanceRange] = useState(0);
  const optimizationId = useIsRouteOptimization();
  const { data: teamNeighbourClusters, isPending: teamNeighbourClustersLoading } = useCalculateTeamNeighbourClusters(adminId, distanceRange);

  return (
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
      <Box>
        {!teamNeighbourClusters && <TeamNeighbourClustersLoadingView />}
        {teamNeighbourClusters && <TeamNeighbourClusterView teamNeighbourClusters={teamNeighbourClusters} loading={teamNeighbourClustersLoading} distanceRange={distanceRange} />}
      </Box>

      <Divider sx={{ mb: 4, mt: 4 }} />

      <MealsRouteFilterView />
    </Box>
  );
}

function MealsRouteFilterView() {
  const { t } = useTranslation(['common', 'admin']);
  const { dispatch, state } = useDinnerRouteOverviewContext();
  const { mealFilterOptions, mealFilter, afterPartyLocation } = state;

  const isMobileDevice = useIsMobileDevice();

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
          {mealFilterOption.fromMeal?.label} &nbsp;=&gt;&nbsp; <strong>{mealFilterOption.toMeal?.label}</strong>
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
  );
}
