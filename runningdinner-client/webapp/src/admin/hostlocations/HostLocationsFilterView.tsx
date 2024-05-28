import { Box, Checkbox, FormControlLabel, Paper, styled } from "@mui/material";
import { Span, Subtitle } from "../../common/theme/typography/Tags";
import { DinnerRouteTeamMapEntry } from "../../common/dinnerroute";
import { Fullname } from "@runningdinner/shared";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import { Virtuoso } from "react-virtuoso";
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
  padding: theme.spacing(2),
}));


type HostLocationsFilterViewProps = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  filteredTeams: Record<number, DinnerRouteTeamMapEntry>,
  onFilterChange: (team: DinnerRouteTeamMapEntry, open: boolean) => void;
}

export function HostLocationsFilterView({dinnerRouteMapEntries, filteredTeams, onFilterChange}: HostLocationsFilterViewProps) {

  const teamsFilterContainerRef = useRef(null);
  const teamsFilterHeight = useDynamicFullscreenHeight(teamsFilterContainerRef, 300) - 200;

  return (
    <HostFilterPaper elevation={3} id="HostFilterPaper" ref={teamsFilterContainerRef}>
      <Subtitle>Filter</Subtitle>
      <div style={{ height: `${teamsFilterHeight}px` }}>
        <Span>Wähle einzelne Teams aus zur Routen-Filterung</Span>
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
      </div>
    </HostFilterPaper>
  )
}