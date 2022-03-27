import React from 'react'
import { TableContainer, Paper, Table, TableBody, Grid, Box, }from "@material-ui/core";
import ParticipantRow from "./ParticipantRow";
import {
  getAssignableParticipants,
  getNotAssignableParticipants,
  getParticipantsOrganizedInTeams, getRunningDinnerMandatorySelector,
  isSameEntity,
  useAdminSelector,
  useNumberOfParticipants
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import { WaitingListManagementAlert } from './WaitingListManagementAlert';

export default function ParticipantsList({participants, selectedParticipant, participantsListInfo, hasSearchText, onClick}) {

  const {t} = useTranslation('admin');

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const { sessionData } = runningDinner;
  const { numberOfParticipantsWaitingList, hasNotEnoughtParticipantsForDinner } = useNumberOfParticipants(participants, sessionData);

  const notAssignableParticipants = getNotAssignableParticipants(participants);

  const participantsOrganizedInTeamsRows = buildParticipantRows(getParticipantsOrganizedInTeams(participants));
  const participantsAssignableRows = buildParticipantRows(getAssignableParticipants(participants));
  const participantsNotAssignableRows = buildParticipantRows(notAssignableParticipants);

  function buildParticipantRows(_participants) {
    return _participants.map((participant) =>
                <ParticipantRow key={participant.id} participant={participant} onClick={onClick}
                                selected={isSameEntity(selectedParticipant, participant)} runningDinnerSessionData={sessionData} />
    );
  }

  const showParticiapntsOnWaitingListInOwnSection = !hasSearchText && numberOfParticipantsWaitingList > 0;

  return (
      <Grid container>
        <Grid item xs={12}>

          {participantsListInfo}

          <TableContainer component={Paper}>
            <Table size={"small"}>
              <TableBody>
                {participantsOrganizedInTeamsRows}
                {participantsAssignableRows}
                { (hasSearchText || hasNotEnoughtParticipantsForDinner) && participantsNotAssignableRows}
              </TableBody>
            </Table>
          </TableContainer>

          {showParticiapntsOnWaitingListInOwnSection &&
            <Box mt={2}>
              <Box mb={2}>
                <WaitingListManagementAlert participantsNotAssignable={notAssignableParticipants} runningDinner={runningDinner} />
              </Box>
              <TableContainer component={Paper}>
                <Table size={"small"}>
                  <TableBody>{participantsNotAssignableRows}</TableBody>
                </Table>
              </TableContainer>
            </Box>
          }

        </Grid>
      </Grid>
  );

}
