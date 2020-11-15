import Grid from "@material-ui/core/Grid";
import React, {useContext} from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TeamRow from "./TeamRow";
import {AdminContext} from "../AdminContext";
import {isSameEntity} from "../../shared/Utils";

export default function TeamsList({teams, selectedTeam, onClick, onTeamMemberSwap, onOpenChangeTeamHostDialog}) {

  const { runningDinner } = useContext(AdminContext);
  const { sessionData } = runningDinner;
  const teamSize = runningDinner.options.teamSize;

  function buildTeamRows(teans) {
    return teams.map(team => <TeamRow team={team} key={team.id} onClick={onClick} onTeamMemberSwap={onTeamMemberSwap} onOpenChangeTeamHostDialog={onOpenChangeTeamHostDialog}
                                      runningDinnerSessionData={sessionData} teamSize={teamSize} selected={isSameEntity(selectedTeam, team)}/>);
  }

  const teamRows = buildTeamRows(teams);

  return (
      <Grid container>
        <Grid item xs={12}>

          <TableContainer component={Paper}>
            <Table size={"small"}>
              <TableBody>
                { teamRows }
              </TableBody>
            </Table>
          </TableContainer>

        </Grid>
      </Grid>
  );

}
