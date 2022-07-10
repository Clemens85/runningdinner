import {useAsync} from "react-async-hook";
import { isAfterInDays } from "../../date";
import { findParticipantsAsync } from "../ParticipantService";
import { isClosedDinner } from "../RunningDinnerService";
import {ParticipantList, RunningDinner} from "../../types";

export interface TeamsNotExistingInfo {
  numParticipants: number,
  numAssignableParticipants: number,
  numNotAssignableParticipants: number,
  registrationStillRunning: boolean,
  numExpectedTeams: number,
  endOfRegistrationDate?: Date,
  warnTeamsCanBeCreatedButRegistrationStillRunning?: boolean;
  infoTeamCreationNotPossibleAndRegistrationStillRunning?: boolean;
}

export function useTeamsNotExisting(runningDinner: RunningDinner) {

  const { adminId } = runningDinner;

  const asyncResult = useAsync(findParticipantsAsync, [adminId]);

  const  { loading, error : errorObj } = asyncResult;
  let error = null;
  if (errorObj) {
    error = errorObj.message;
  }

  let teamsNotExistingInfo = null;
  if (!loading && !error) {
    // @ts-ignore
    teamsNotExistingInfo = calculateTeamsNotExistingInfo(asyncResult.result);
  }

  function calculateTeamsNotExistingInfo(participantList: ParticipantList): TeamsNotExistingInfo {

    let numAssignableParticipants;
    let numNotAssignableParticipants;

    const {numParticipantsTotal} = participantList;
    const {missingParticipantsInfo} = participantList;

    if (missingParticipantsInfo.numParticipantsMissing > 0) {
      numNotAssignableParticipants = numParticipantsTotal;
      numAssignableParticipants = 0;
    } else {
      numNotAssignableParticipants = participantList.participantsWaitingList.length;
      numAssignableParticipants = participantList.participants.length;
    }

    const result: TeamsNotExistingInfo = {
      numParticipants: numParticipantsTotal,
      numAssignableParticipants,
      numNotAssignableParticipants,
      registrationStillRunning: false,
      numExpectedTeams: numAssignableParticipants / runningDinner.options.teamSize
    };

    if (!isClosedDinner(runningDinner) && runningDinner.publicSettings.endOfRegistrationDate) {
      result.endOfRegistrationDate = runningDinner.publicSettings.endOfRegistrationDate;
      result.registrationStillRunning = !isAfterInDays(new Date(), result.endOfRegistrationDate);
      if (result.registrationStillRunning) {
        if (result.numExpectedTeams > 0) {
          result.warnTeamsCanBeCreatedButRegistrationStillRunning = true;
        } else {
          result.infoTeamCreationNotPossibleAndRegistrationStillRunning = true;
        }
      }
    }

    return result;
  }

  return [teamsNotExistingInfo, loading, error];
}
