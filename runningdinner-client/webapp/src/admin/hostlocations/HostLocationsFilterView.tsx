import { Box, Checkbox, FormControlLabel, Grid, IconButton, Paper, styled } from "@mui/material";
import { Span, Subtitle } from "../../common/theme/typography/Tags";
import { DinnerRouteTeamMapEntry } from "../../common/dinnerroute";
import { Fullname } from "@runningdinner/shared";
import { Virtuoso } from "react-virtuoso";
import MinimizeIcon from '@mui/icons-material/Minimize';
import { useRef } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";

function getTeamLabel(team: DinnerRouteTeamMapEntry) {
  return <>Team {team.teamNumber} ({team.meal.label}) - <Fullname {...team.hostTeamMember} /></>;
}

const HostFilterPaper = styled(Paper)(({theme}) => ({
  top: 160,
  right: 50,
  position: 'fixed',
  minWidth: 250,
  maxWidth: 400,
  // padding: theme.spacing(2),
}));


type HostLocationsFilterViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  filteredTeams: Record<number, DinnerRouteTeamMapEntry>,
  onFilterChange: (team: DinnerRouteTeamMapEntry, open: boolean) => void;
}

export function HostLocationsFilterView({dinnerRouteMapEntries, filteredTeams, onFilterChange}: HostLocationsFilterViewProps) {

  const teamsFilterContainerRef = useRef(null);
  const teamsFilterHeight = useDynamicFullscreenHeight(teamsFilterContainerRef, 300, true) - 200;

  return (
    <HostFilterPaper elevation={3} id="HostFilterPaper" ref={teamsFilterContainerRef}>
      <Box sx={{ backgroundColor: 'green'}}>
        <Grid container justifyContent={"space-between"} alignItems={"center"}>
          <Grid item sx={{ paddingTop: 1, paddingLeft: 1, color: 'white' }}>
            <Subtitle>Filter</Subtitle>
          </Grid>
          <Grid item alignContent={"end"}>
            <IconButton onClick={() => {}} sx={{ color: 'white'}}>
              <MinimizeIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ height: `${teamsFilterHeight}px`, padding: 3 }}>
        <Box pb={1}>
          <Span>Wähle einzelne Teams aus zur Routen-Filterung</Span>
        </Box>
        <Virtuoso 
          data={dinnerRouteMapEntries}
          style={{ height: '100%' }}
          itemContent={(_, team) => (
            <Box>
              <FormControlLabel sx={{ color: team.color}} label={getTeamLabel(team)} control={
                <Checkbox color="primary" 
                          onChange={() => onFilterChange(team, !filteredTeams[team.teamNumber])} 
                          checked={!!filteredTeams[team.teamNumber]} />
              } />
            </Box>
          )}>
        </Virtuoso>
      </Box>
    </HostFilterPaper>
  )
}