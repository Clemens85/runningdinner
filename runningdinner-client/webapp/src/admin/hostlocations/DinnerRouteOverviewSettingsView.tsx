import { Box, Chip, CircularProgress, Divider, Fab, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, SelectChangeEvent, Slider, styled, Switch, SxProps, Typography } from "@mui/material";
import { TitleBar } from "./TitleBar";
import { useTranslation } from "react-i18next";
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext, DinnerRouteTeamMapEntry, Time, enhanceTeamDistanceClusterWithDinnerRouteMapEntries, TeamDistanceClusterWithMapEntry, isSameEntity, ALL_MEALS_OPTION, isDefined, DinnerRouteWithDistances } from "@runningdinner/shared";
import { SmallTitle, Span } from "../../common/theme/typography/Tags";
import { BaseAdminIdProps, TeamDistanceCluster } from "@runningdinner/shared";
import { useCalculateTeamDistanceClusters } from "./useCalculateTeamDistanceClusters";
import { useState } from "react";
import { useCalculateRouteDistances } from "./useCalculateRouteDistances";
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { Virtuoso } from "react-virtuoso";
import React from "react";

type DinnerRouteOverviewSettingsViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
} & BaseAdminIdProps;


export function DinnerRouteOverviewSettingsView({adminId, dinnerRouteMapEntries}: DinnerRouteOverviewSettingsViewProps) {

  const {t} = useTranslation(['common', 'admin']);
  const {dispatch, state} = useDinnerRouteOverviewContext();
  const {mealFilterOptions, mealFilter, afterPartyLocation} = state;

  const [distanceRange, setDistanceRange] = useState(0);
  const [showRouteDistances, setShowRouteDistances] = useState(false);

  const {data: teamDistanceClusters} = useCalculateTeamDistanceClusters(adminId, dinnerRouteMapEntries, distanceRange);

  const {data: routeDistances} = useCalculateRouteDistances(adminId, dinnerRouteMapEntries);
  
  const settingsPaperStyles: SxProps = {
    top: 80,
    left: 40,
    position: 'fixed',
    minWidth: 300,
    maxWidth: 480
  };

  function handleMinimizeView() {
    dispatch({ 
      type: DinnerRouteOverviewActionType.UPDATE_SETTINGS_VIEW_MINIMIZED, 
      payload: true
    });
  }

  function handleMealFilterChange(mealId: string) {
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_MEAL_FILTER,
      payload: mealId
    });
  }

  const filterMealsLabel = "Routen für Koch-Teams von A nach B";

  return (
    <>
      <Paper
          id="dinnerRouteOverviewSettings"
          sx={settingsPaperStyles} 
          elevation={3}>
          
        <TitleBar onToggleMinize={handleMinimizeView} title={t("common:settings")} />

        <Box p={2}>

        <Box>
            <SmallTitle>Gastgeber mit geringer Entfernung zueinander (in Metern)</SmallTitle>
            <Box px={2}>
              <Slider aria-label="Entfernung"
                      value={distanceRange}
                      onChange={(_evt, newValue) => setDistanceRange(newValue as number)}
                      getAriaValueText={() => `${distanceRange} m`}
                      step={50}
                      marks={[
                        { value: 0, label: "0 m"},
                        { value: 250, label: "250 m"},
                        { value: 500, label: "500 m"},
                        { value: 750, label: "750 m"},
                        { value: 1000, label: "1 km"}
                      ]}
                      min={0}
                      valueLabelDisplay="auto"
                      max={1000} />
              </Box>
          </Box>          
          <Box>
            { !teamDistanceClusters && <TeamDistanceClustersLoadingView /> } 
            { teamDistanceClusters && <TeamDistanceClusterView teamDistanceClusters={teamDistanceClusters} 
                                                               dinnerRouteMapEntries={dinnerRouteMapEntries}
                                                               distanceRange={distanceRange}/> }
          </Box>

          <Divider sx={{ mb: 4, mt: 4 }}/>

          <Box>
            <SmallTitle>Koch-Team Routen Filter</SmallTitle>
            <FormControl variant="outlined" sx={{ mt: 1, minWidth: '400px' }} size="small">
              <InputLabel>{filterMealsLabel}</InputLabel>
              <Select
                variant="outlined"
                label={filterMealsLabel}
                autoWidth
                value={mealFilter?.id}
                size="small"
                onChange={(evt: SelectChangeEvent) => handleMealFilterChange(evt.target.value)}
                inputProps={{ 'aria-label': filterMealsLabel }}>
                { mealFilterOptions.map(mealFilterOption => 
                    <MenuItem value={mealFilterOption.id} key={mealFilterOption.id}>
                      { isSameEntity(mealFilterOption, ALL_MEALS_OPTION) && <>Alle</> }
                      { isDefined(mealFilterOption.toMeal) && <>{mealFilterOption.fromMeal?.label} &nbsp;=&gt;&nbsp; <strong>{mealFilterOption.toMeal.label}</strong></> }
                      { (!isSameEntity(mealFilterOption, ALL_MEALS_OPTION) && !isDefined(mealFilterOption.toMeal)) && <><strong>{mealFilterOption.fromMeal?.label}</strong> &nbsp;=&gt;&nbsp; {afterPartyLocation?.title}</> }
                    </MenuItem>
                )}
              </Select>
              { !isSameEntity(mealFilter, ALL_MEALS_OPTION) &&
                  <FormHelperText>Route für Teams welche <strong>{mealFilter.toMeal?.label}</strong> zubereiten und von {mealFilter.fromMeal?.label} kommen</FormHelperText> }
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3, mt: 4 }}/>
          <Box>
            <FormGroup>
              <FormControlLabel 
                control={<Switch onChange={evt => setShowRouteDistances(evt.target.checked)} checked={showRouteDistances} />} 
                label="Zeige Entfernungen pro Route" />
            </FormGroup>
            { showRouteDistances && <RouteDistancesView routeDistances={routeDistances} /> }
          </Box>

        </Box>
      </Paper>
    </>
  );
}


type RouteDistancesViewProps = {
  routeDistances: DinnerRouteWithDistances[] | undefined;
};


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

const HrGreenLine = styled('hr')(({theme}) => ({
  marginTop: '-3px', 
  borderColor: theme.palette.primary.light, 
  width: '130%'
}));
const HrRedLine = styled('hr')(({theme}) => ({
  marginTop: '-3px', 
  borderColor: theme.palette.secondary.light, 
  width: '130%'
}));

function RouteDistancesView({routeDistances}: RouteDistancesViewProps) {

  if (!routeDistances) {
    return <LinearProgress variant="determinate" />;
  }

  return (
    <Box sx={{ height: "380px" }}>
      <Virtuoso 
        data={routeDistances}
        itemContent={(_, routeDistance) => <>
        <Box pr={1}>
          <Grid container justifyContent="space-between" alignItems={"center"}>
            { routeDistance.teams.map((team, index) =>
              <React.Fragment key={index}>
                <Grid item sx={{ my: 2 }}>
                  <Chip label={`Team ${team.teamNumber}`} color={team.currentTeam ? "primary" : "default"} variant={team.currentTeam ? "filled" : "outlined"} />
                </Grid>
                { isDefined(team.distanceToNextTeam) &&
                  <Grid>
                      <Typography variant="body2" color={team.largestDistanceInRoute ? 'secondary' : 'primary'}>{ Math.round(team.distanceToNextTeam) } km</Typography>
                      { team.largestDistanceInRoute ? <HrRedLine/> : <HrGreenLine /> }
                  </Grid>
                }
              </React.Fragment>
            )}
            </Grid>
          </Box>
        </>}>
      </Virtuoso>
    </Box>
  );
}


function TeamDistanceClustersLoadingView() {
  return (
    <Grid container alignItems="center" sx={{ my: 2 }}>
      <Grid item><CircularProgress size={20} /></Grid>
      <Grid item>
        <Box sx={{ ml: 2 }}><small>Lade Team-Entfernungen...</small></Box>
      </Grid>
    </Grid>
  )
}

type TeamDistanceClusterViewProps = {
  teamDistanceClusters: TeamDistanceCluster[];
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  distanceRange: number;
};
function TeamDistanceClusterView({teamDistanceClusters, dinnerRouteMapEntries, distanceRange}: TeamDistanceClusterViewProps) {

  if (teamDistanceClusters.length === 0) {
    return <Box sx={{ my: 2 }}><small>Keine Teams gefunden welche unter {distanceRange} m zueinander liegen.</small></Box>;
  }

  function buildClusterKey(cluster: TeamDistanceCluster): string {
    return cluster.teams.map(team => team.teamNumber).join("-");
  }

  return (
    <>
    { teamDistanceClusters.map(cluster => 
      <Box key={buildClusterKey(cluster)} sx={{ my: 2 }}>
        <SingleTeamClusterView {...enhanceTeamDistanceClusterWithDinnerRouteMapEntries(cluster, dinnerRouteMapEntries)} />
      </Box>
    )}
    </>
  );
}


function SingleTeamClusterView({dinnerRouteMapEntries, distance}: TeamDistanceClusterWithMapEntry) {

  if (dinnerRouteMapEntries?.length !== 2) {
    return null;
  }

  const firstTeam = dinnerRouteMapEntries[0].teamNumber < dinnerRouteMapEntries[1].teamNumber ? dinnerRouteMapEntries[0] : dinnerRouteMapEntries[1];
  const secondTeam = dinnerRouteMapEntries[0].teamNumber > dinnerRouteMapEntries[1].teamNumber ? dinnerRouteMapEntries[0] : dinnerRouteMapEntries[1];

  return (
    <Grid container justifyContent="space-between" alignItems={"center"}>
      <Grid item>
        <TeamClusterItem {...firstTeam} />
      </Grid>
      <Grid item>
        <Box>
          <center>{Math.round(distance * 1000)} m</center>
        </Box>
      </Grid>
      <Grid item>
        <TeamClusterItem {...secondTeam} />
      </Grid>
    </Grid>
  )
}

function TeamClusterItem(team: DinnerRouteTeamMapEntry) {

  const {t} = useTranslation('common');

  return (
    <Box sx={{ color: team.color, margin: '0 auto', border: '2px solid', borderRadius: '8px', borderColor: team.color, padding: "4px" }}>
      <Span>
        Team #{team.teamNumber} {t("common:at_time")} <Time date={team.meal.time} />
      </Span>
      <Span>{team.meal.label}</Span>
    </Box>
  );
}


const MinimizedFab = styled(Fab)({
  margin: 0,
  top: 'auto',
  left: 40,
  bottom: 40,
  right: 'autp',
  minWidth: 100,
  position: 'fixed',
});

export function DinnerRouteOverviewSettingsMinimizedButton() {

  const {dispatch} = useDinnerRouteOverviewContext();
  const {t} = useTranslation('common');

  function handleMaximizeView() {
    dispatch({ 
      type: DinnerRouteOverviewActionType.UPDATE_SETTINGS_VIEW_MINIMIZED, 
      payload: false
    });
  }

  return (
    <MinimizedFab variant="extended" color="primary" onClick={handleMaximizeView}>
      {t('common:settings')}
      <OpenInFullRoundedIcon sx={{ ml: 1 }} />
    </MinimizedFab>
  )
}