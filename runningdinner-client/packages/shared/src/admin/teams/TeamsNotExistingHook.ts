import {useAsync} from "react-async-hook";
import { isAfterInDays } from "../../date";
import { findParticipantsAsync, getNotAssignableParticipants, getAssignableParticipants } from "../ParticipantService";
import { isClosedDinner } from "../RunningDinnerService";
import {Participant, RunningDinner} from "../../types";

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

export default function useTeamsNotExisting(runningDinner: RunningDinner) {

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

  function calculateTeamsNotExistingInfo(participants: Participant[]): TeamsNotExistingInfo {

    const numAssignableParticipants = getAssignableParticipants(participants).length;
    const numNotAssignableParticipants = getNotAssignableParticipants(participants).length;

    const result: TeamsNotExistingInfo = {
      numParticipants: participants.length,
      numAssignableParticipants,
      numNotAssignableParticipants,
      registrationStillRunning: false,
      numExpectedTeams: numAssignableParticipants / runningDinner.options.teamSize
    };

    if (!isClosedDinner(runningDinner)) {
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
