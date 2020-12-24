import ParticipantService from "../ParticipantService";
import RunningDinnerService from "../RunningDinnerService";
import {isAfterInDays} from "../../date/DateUtils";
import {useAsync} from "react-async-hook";

export default function useTeamsNotExisting(runningDinner) {

  const { adminId } = runningDinner;

  const asyncResult = useAsync(ParticipantService.findParticipantsAsync, [adminId]);

  const  { loading, error : errorObj } = asyncResult;
  let error = null;
  if (errorObj) {
    error = errorObj.message;
  }

  let teamsNotExistingInfo = null;
  if (!loading && !error) {
    teamsNotExistingInfo = calculateTeamsNotExistingInfo(asyncResult.result);
  }

  function calculateTeamsNotExistingInfo(participants) {
    const result = {
      numParticipants: participants.length,
      numAssignableParticipants: ParticipantService.getAssignableParticipants(participants).length,
      numNotAssignableParticipants: ParticipantService.getNotAssignableParticipants(participants).length,
      registrationStillRunning: false
    };

    result.numExpectedTeams = result.numAssignableParticipants / runningDinner.options.teamSize;

    if (!RunningDinnerService.isClosedDinner(runningDinner)) {
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
