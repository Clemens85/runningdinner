import React from 'react'
import { TableContainer, Paper, Table, TableBody, Box }from "@mui/material";
import ParticipantRow, {ParticipantClickCallback} from "./ParticipantRow";
import {
  getRunningDinnerMandatorySelector, isArrayNotEmpty,
  isSameEntity,
  ParticipantList,
  ParticipantListable,
  useAdminSelector,
} from "@runningdinner/shared";
import {ReFetchParticipantsCallback, WaitingListManagementAlert} from './WaitingListManagementAlert';
import {SpacingGrid} from "../../../common/theme/SpacingGrid";
import {ParticipantSearchResult} from "./ParticipantsListHeader";

export type ParticipantsListProps = {
  participantsListInfo: React.ReactNode;
  participantList: ParticipantList;
  participantSearchResult: ParticipantSearchResult;
  selectedParticipant?: ParticipantListable;
  showMiscNotes: boolean;
} & ParticipantClickCallback & ReFetchParticipantsCallback;

export default function ParticipantsListView({participantList, selectedParticipant, participantsListInfo, participantSearchResult, onClick, onReFetch, showMiscNotes}: ParticipantsListProps) {

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const { sessionData } = runningDinner;

  function buildParticipantRows(_participants: ParticipantListable[]) {
    return _participants.map((participant) =>
      <ParticipantRow key={participant.id} participant={participant} onClick={onClick}
                      selected={isSameEntity(selectedParticipant, participant)}
                      showMiscNotes={showMiscNotes}
                      runningDinnerSessionData={sessionData} />
    );
  }

  const {hasSearchText, filteredParticipants} = participantSearchResult;

  let participantsRows;
  let participantsWaitinglistRows;
  if (hasSearchText) {
    participantsRows = buildParticipantRows(filteredParticipants);
    participantsWaitinglistRows = buildParticipantRows([]);
  } else {
    participantsRows = buildParticipantRows(participantList.participants);
    participantsWaitinglistRows = buildParticipantRows(participantList.participantsWaitingList);
  }

  const showParticipantsOnWaitingListInOwnSection = !hasSearchText && isArrayNotEmpty(participantsWaitinglistRows);

  return (
      <SpacingGrid container>
        <SpacingGrid item xs={12} mb={2}>

          {participantsListInfo}

          <TableContainer component={Paper}>
            <Table size={"small"}>
              <TableBody>{participantsRows}</TableBody>
            </Table>
          </TableContainer>

          {showParticipantsOnWaitingListInOwnSection &&
            <Box mt={2} data-testid={"waitinglist-participants"}>
              <Box mb={2}>
                <WaitingListManagementAlert runningDinner={runningDinner} onReFetch={onReFetch} teamsGenerated={participantList.teamsGenerated}/>
              </Box>
              <TableContainer component={Paper}>
                <Table size={"small"}>
                  <TableBody>{participantsWaitinglistRows}</TableBody>
                </Table>
              </TableContainer>
            </Box>
          }

        </SpacingGrid>
      </SpacingGrid>
  );

}
