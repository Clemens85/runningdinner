import { Box, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Slider, styled, SxProps } from "@mui/material";
import { TitleBar } from "./TitleBar";
import { useTranslation } from "react-i18next";
import { DinnerRouteOverviewActionType, getDinnerRouteTeamLabel, useDinnerRouteOverviewContext, DinnerRouteTeamMapEntry } from "@runningdinner/shared";
import { SmallTitle } from "../../common/theme/typography/Tags";
import { BaseAdminIdProps, isAfterPartyLocationDefined, Team, TeamDistanceCluster } from "@runningdinner/shared";
import { useCalculateTeamDistanceClusters } from "./useCalculateTeamDistanceClusters";
import { useState } from "react";

type DinnerRouteOverviewSettingsViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
} & BaseAdminIdProps;


export function DinnerRouteOverviewSettingsView({adminId, dinnerRouteMapEntries}: DinnerRouteOverviewSettingsViewProps) {

  const {t} = useTranslation(['common', 'admin']);
  const {dispatch, state} = useDinnerRouteOverviewContext();
  const {mealFilterOptions, mealFilter, afterPartyLocation, excludeAfterPartyLocation} = state;

  const [distanceRange, setDistanceRange] = useState(0);

  const {data: teamDistanceClusters} = useCalculateTeamDistanceClusters(adminId, dinnerRouteMapEntries, distanceRange);
  
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

  function handleToggleExcludeAfterPartyLocation() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_EXCLUDE_AFTER_PARTY_LOCATION
    })
  }

  function handleMealFilterChange(mealId: string) {
    dispatch({
      type: DinnerRouteOverviewActionType.UPDATE_MEAL_FILTER,
      payload: mealId
    });
  }

  const filterMealsLabel = "Zeige nur Routen für Speise";

  return (
    <>
      <Paper
          id="dinnerRouteOverviewSettings"
          sx={settingsPaperStyles} 
          elevation={3}>
          
        <TitleBar onToggleMinize={handleMinimizeView} title={t("common:settings")} />

        <Box p={3}>
          <Box>
            <SmallTitle>Speisen</SmallTitle>
            <FormControl variant="outlined" sx={{ mt: 1, minWidth: '250px' }} size="small">
              <InputLabel>{filterMealsLabel}</InputLabel>
              <Select
                variant="outlined"
                label={filterMealsLabel}
                autoWidth
                value={mealFilter?.id}
                size="small"
                onChange={(evt: SelectChangeEvent) => handleMealFilterChange(evt.target.value)}
                inputProps={{ 'aria-label': filterMealsLabel }}>
                { mealFilterOptions.map(meal => 
                    <MenuItem value={meal.id} key={meal.id}>
                      {meal.label}
                    </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
          
          { isAfterPartyLocationDefined(afterPartyLocation) &&
            <>
              <Divider sx={{ mb: 2, mt: 4 }} />
              <Box>
                <FormControlLabel label={`Inkludiere ${afterPartyLocation?.title}`} control={
                  <Checkbox color="primary" onChange={handleToggleExcludeAfterPartyLocation} checked={!excludeAfterPartyLocation} />
                } />
              </Box>
            </>
          }

          <Divider sx={{ mb: 4, mt: 2 }}/>
          <Box>
            <SmallTitle>Gastgeber mit geringer Entfernung zueinander (in Metern)</SmallTitle>
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
          <Box>
            { !teamDistanceClusters && <TeamDistanceClustersLoadingView /> } 
            { teamDistanceClusters && <TeamDistanceClusterView teamDistanceClusters={teamDistanceClusters} distanceRange={distanceRange}/> }
          </Box>

        </Box>
      </Paper>
    </>
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
  distanceRange: number;
};
function TeamDistanceClusterView({teamDistanceClusters, distanceRange}: TeamDistanceClusterViewProps) {

  if (teamDistanceClusters.length === 0) {
    return <Box sx={{ my: 2 }}>Keine Teams gefunden welche unter {distanceRange} m zueinander liegen.</Box>;
  }

  function buildClusterKey(cluster: TeamDistanceCluster): string {
    return cluster.teams.map(team => team.teamNumber).join("-");
  }

  return (
    <>
    { teamDistanceClusters.map(cluster => 
      <Box key={buildClusterKey(cluster)} sx={{ my: 2 }}>
        <SingleTeamClusterView teams={cluster.teams} distance={cluster.distance} />
      </Box>
    )}
    </>
  );

}


function SingleTeamClusterView({teams, distance}: TeamDistanceCluster) {

  if (teams?.length !== 2) {
    return null;
  }

  const firstTeam = teams[0].teamNumber < teams[1].teamNumber ? teams[0] : teams[1];
  const secondTeam = teams[0].teamNumber > teams[1].teamNumber ? teams[0] : teams[1];

  return (
    <Grid container justifyContent="space-between" alignItems={"center"}>
      <Grid item xs={5}>
        <TeamClusterItem {...firstTeam} />
      </Grid>
      <Grid item xs={2}>
        <Box>
          <center>{Math.round(distance * 1000)} m</center>
        </Box>
      </Grid>
      <Grid item xs={5}>
        <TeamClusterItem {...secondTeam} />
      </Grid>
    </Grid>
  )
}

const TeamBox = styled(Box)(({theme}) => ({
  margin: '0 auto',
  border: '2px solid',
  borderRadius: "16px",
  borderColor: theme.palette.primary.main,
  padding: theme.spacing(1),
}));

function TeamClusterItem(team: Team) {
  return (
    <TeamBox>
      { getDinnerRouteTeamLabel(team, false, true) }
    </TeamBox>
  );
}

