import { AppBar, Box, Checkbox, Fab, FormControlLabel, IconButton, Paper, styled, SxProps, Toolbar, Typography } from "@mui/material";
import { Span } from "../../common/theme/typography/Tags";
import { DinnerRouteTeamMapEntry } from "../../common/dinnerroute";
import { CallbackHandler, DinnerRouteTeam, Fullname } from "@runningdinner/shared";
import { Virtuoso } from "react-virtuoso";
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { useRef } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { useIsBigDevice, useIsMobileDevice } from "../../common/theme/CustomMediaQueryHook";

function getTeamLabel(team: DinnerRouteTeam, includeHostFullname: boolean) {
  if (includeHostFullname) {
    return <>Team #{team.teamNumber} ({team.meal.label}) - <Fullname {...team.hostTeamMember} /></>;
  } else {
    return <>Team #{team.teamNumber} ({team.meal.label})</>;
  }
}

type HostLocationsFilterMinimizeProps = {
  onToggleMinize: CallbackHandler;
};

type OnFilterChangeProps = {
  onFilterChange: (team: DinnerRouteTeamMapEntry, open: boolean) => void;
};

type HostLocationsFilterViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  filteredTeams: Record<number, DinnerRouteTeamMapEntry>,
} & HostLocationsFilterMinimizeProps & OnFilterChangeProps;


const MinimizedFab = styled(Fab)({
  margin: 0,
  top: 'auto',
  left: 'auto',
  bottom: 40,
  right: 80,
  minWidth: 100,
  position: 'fixed',
});

export function HostLocationsFilterMinimizedButton({onToggleMinize}: HostLocationsFilterMinimizeProps) {
  return (
    <MinimizedFab variant="extended" color="primary" onClick={onToggleMinize}>
      Filter
      <OpenInFullRoundedIcon sx={{ ml: 1 }} />
    </MinimizedFab>
  )
}

export function HostLocationsFilterView({dinnerRouteMapEntries, filteredTeams, onFilterChange, onToggleMinize}: HostLocationsFilterViewProps) {

  
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

  function renderTitleBar2() {
    return (
      <AppBar sx={{ position: 'relative', color: '#fff', backgroundColor: 'primary.main' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ ml: 0, flex: 1 }}>Filter</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onToggleMinize}
          aria-label="close"
          size="large">
            <ExpandCircleDownOutlinedIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    )
  }

  return (
    <Paper elevation={3} 
           id="HostFilterPaper" 
           sx={hostFilterPaperStyles}
           ref={teamsFilterContainerRef}>
      { renderTitleBar2() }
      <Box sx={{ height: `${teamsFilterHeight}px`, padding: 3 }}>
        <Box pb={1}>
          <Span i18n="admin:hostlocations_team_filter" />
        </Box>
        <Virtuoso 
          data={dinnerRouteMapEntries}
          style={{ height: '92%' }}
          itemContent={(_, team) => (
            <FilterTeamCheckbox team={team}
                                selected={!!filteredTeams[team.teamNumber]}
                                onFilterChange={(team, selected) => onFilterChange(team, selected)} />
          )}>
        </Virtuoso>
      </Box>
    </Paper>
  )
}

type FilterTeamCheckboxProps = {
  team: DinnerRouteTeamMapEntry;
  selected?: boolean;
} & OnFilterChangeProps;

function FilterTeamCheckbox({ team, selected, onFilterChange }: FilterTeamCheckboxProps) {
  
  const isBigDevice = useIsBigDevice();

  const hostTeams = team.teamConnectionPaths
                          .filter(tcp => tcp.team)
                          .map(tcp => tcp.team!)
                          .filter(t => t.teamNumber !== team.teamNumber);

  return (
    <>
      <Box sx={{ mb: '-12px' }}>
        <FormControlLabel sx={{ color: team.color }} label={getTeamLabel(team, isBigDevice)} control={
          <Checkbox color="primary" 
                    onChange={() => onFilterChange(team, !selected)} 
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