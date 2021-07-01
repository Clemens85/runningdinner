import React from 'react'
import { TableContainer, Paper, Table, TableBody, Grid, Box, }from "@material-ui/core";
import ParticipantRow from "./ParticipantRow";
import {Alert, AlertTitle} from "@material-ui/lab";
import {
  getAssignableParticipants,
  getNotAssignableParticipants,
  getParticipantsOrganizedInTeams, getRunningDinnerMandatorySelector,
  isSameEntity,
  useAdminSelector,
  useNumberOfParticipants
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";

export default function ParticipantsList({participants, selectedParticipant, participantsListInfo, hasSearchText, onClick}) {

  const {t} = useTranslation('admin');

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const { sessionData } = runningDinner;
  const { numberOfParticipantsWaitingList, hasNotEnoughtParticipantsForDinner } = useNumberOfParticipants(participants, sessionData);

  const participantsOrganizedInTeams = buildParticipantRows(getParticipantsOrganizedInTeams(participants));
  const participantsAssignable = buildParticipantRows(getAssignableParticipants(participants));
  const participantsNotAssignable = buildParticipantRows(getNotAssignableParticipants(participants));

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
                {participantsOrganizedInTeams}
                {participantsAssignable}
                { (hasSearchText || hasNotEnoughtParticipantsForDinner) && participantsNotAssignable}
              </TableBody>
            </Table>
          </TableContainer>

          {showParticiapntsOnWaitingListInOwnSection &&
            <Box mt={2}>
              <Box mb={2}>
                <Alert severity={"info"} variant="outlined">
                  <AlertTitle>{t('participants_remaining_not_assignable_headline')}</AlertTitle>
                  {t('participants_remaining_not_assignable_text')}
                </Alert>
              </Box>
              <TableContainer component={Paper}>
                <Table size={"small"}>
                  <TableBody>{participantsNotAssignable}</TableBody>
                </Table>
              </TableContainer>
            </Box>
          }

        </Grid>
      </Grid>
  );

}
