import { Box, Checkbox, FormControlLabel, Paper, styled } from "@mui/material";
import { SmallTitle, Span, Subtitle } from "../../common/theme/typography/Tags";
import { DinnerRouteTeamMapEntry } from "../../common/dinnerroute";
import { Fullname } from "@runningdinner/shared";

function getTeamLabel(team: DinnerRouteTeamMapEntry) {
  return <>Team {team.teamNumber} ({team.meal.label}) - <Fullname {...team.hostTeamMember} /></>;
}

const HostFilterPaper = styled(Paper)(({theme}) => ({
  top: 200,
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

  return (
    <HostFilterPaper elevation={3} id="HostFilterPaper">
      <Subtitle>Filter</Subtitle>
      <Span>Wähle einzelne Teams aus zum Filtern ihrer Routen</Span>

      { dinnerRouteMapEntries.map(team => 
        <Box key={team.teamNumber} >
          <FormControlLabel sx={{ color: team.color}} label={getTeamLabel(team)} control={
            <Checkbox color="primary" 
                      onChange={() => onFilterChange(team, !filteredTeams[team.teamNumber])} 
                      checked={!!filteredTeams[team.teamNumber]} />
          } />
        </Box>
      )}
    </HostFilterPaper>
  )
}