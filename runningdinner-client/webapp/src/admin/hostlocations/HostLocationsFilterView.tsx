import {Box, Checkbox, Fab, FormControlLabel, Paper, styled, SxProps } from "@mui/material";
import { Span } from "../../common/theme/typography/Tags";
import { Virtuoso } from "react-virtuoso";
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { useRef } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { useIsBigDevice, useIsMobileDevice } from "../../common/theme/CustomMediaQueryHook";
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext, DinnerRouteTeamMapEntry, getHostTeamsOfDinnerRouteMapEntry, DinnerRouteTeam, Fullname } from "@runningdinner/shared";
import { TitleBar } from "./TitleBar";

function getTeamLabel(team: DinnerRouteTeam, includeHostFullname: boolean) {
  if (includeHostFullname) {
    return <>Team #{team.teamNumber} ({team.meal.label}) - <Fullname {...team.hostTeamMember} /></>;
  } else {
    return <>Team #{team.teamNumber} ({team.meal.label})</>;
  }
}

type HostLocationsFilterViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
};

const MinimizedFab = styled(Fab)({
  margin: 0,
  top: 'auto',
  left: 'auto',
  bottom: 40,
  right: 80,
  minWidth: 100,
  position: 'fixed',
});

export function HostLocationsFilterMinimizedButton() {

  const {dispatch} = useDinnerRouteOverviewContext();

  function handleMaximizeFilterView() {
    dispatch({ 
      type: DinnerRouteOverviewActionType.UPDATE_HOST_FILTER_VIEW_MINIMIZED, 
      payload: false
    });
  }

  return (
    <MinimizedFab variant="extended" color="primary" onClick={handleMaximizeFilterView}>
      Filter
      <OpenInFullRoundedIcon sx={{ ml: 1 }} />
    </MinimizedFab>
  )
}

export function HostLocationsFilterView({dinnerRouteMapEntries}: HostLocationsFilterViewProps) {

  const {dispatch} = useDinnerRouteOverviewContext();

  const isMobileDevice = useIsMobileDevice();
  const isBigDevice = useIsBigDevice();

  const teamsFilterContainerRef = useRef(null);
  const teamsFilterHeight = useDynamicFullscreenHeight(teamsFilterContainerRef, 300, true) - (isMobileDevice ? 150 : 200);

  let paperWidth = isMobileDevice ? 150 : 380; // 380 is for tablet devices 
  if (isBigDevice) {
    paperWidth = 470;
  }

  const hostFilterPaperStyles: SxProps = {
    top: 160,
    right: isMobileDevice ? 5 : 50,
    position: 'fixed',
    minWidth: paperWidth,
    maxWidth: 280
  };

  function handleMinimizeFilterView() {
    dispatch({ 
      type: DinnerRouteOverviewActionType.UPDATE_HOST_FILTER_VIEW_MINIMIZED, 
      payload: true
    });
  }

  return (
    <Paper elevation={3} 
           id="HostFilterPaper" 
           sx={hostFilterPaperStyles}
           ref={teamsFilterContainerRef}>
      <TitleBar onToggleMinize={handleMinimizeFilterView} title={'Filter'} />
      <Box sx={{ height: `${teamsFilterHeight}px`, padding: 3 }}>
        <Box pb={1}>
          <Span i18n="admin:hostlocations_team_filter" />
        </Box>
        <Virtuoso 
          data={dinnerRouteMapEntries}
          style={{ height: '92%' }}
          itemContent={(_, team) => (
            <FilterTeamCheckbox team={team} />
          )}>
        </Virtuoso>
      </Box>
    </Paper>
  )
}

type FilterTeamCheckboxProps = {
  team: DinnerRouteTeamMapEntry;
};

function FilterTeamCheckbox({ team }: FilterTeamCheckboxProps) {
  
  const {state, dispatch} = useDinnerRouteOverviewContext();
  const {activeTeamsFilter} = state;

  const selected = !!activeTeamsFilter[team.teamNumber];

  const isBigDevice = useIsBigDevice();

  const hostTeams = getHostTeamsOfDinnerRouteMapEntry(team); 

  function handleChange() {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_ACTIVE_TEAM,
      payload: team
    })
  }

  return (
    <>
      <Box sx={{ mb: '-12px' }}>
        <FormControlLabel sx={{ color: team.color }} label={getTeamLabel(team, isBigDevice)} control={
          <Checkbox color="primary" 
                    onChange={handleChange} 
                    checked={selected} />
        } />
      </Box>

      { isBigDevice &&
        <Box sx={{ pl: 4 }}>
          {hostTeams.map(hostTeam => <Box key={hostTeam.teamNumber}><small>Zu Gast bei {getTeamLabel(hostTeam, false)}</small></Box>) }
        </Box>
      }
    </>
  )
}