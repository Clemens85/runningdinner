import Grid from "@mui/material/Grid";
import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TeamRow from "./TeamRow";
import {getRunningDinnerMandatorySelector, isSameEntity, useAdminSelector} from "@runningdinner/shared";

export default function TeamsList({teams, selectedTeam, onClick, onTeamMemberSwap, onOpenChangeTeamHostDialog}) {

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const { sessionData } = runningDinner;
  const teamSize = runningDinner.options.teamSize;

  function buildTeamRows(teams) {
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
