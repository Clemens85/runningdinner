import {Participant} from "@runningdinner/shared";
import {useHistory} from "react-router-dom";

export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";

function generateTeamPath(adminId: string, teamId: string) {
  return `/admin/${adminId}/teams/${teamId}`;
}

function generateTeamMessagesPath(adminId: string) {
  return generateMessagesPath(adminId, 'teams');
}
function generateParticipantMessagesPath(adminId: string) {
  return generateMessagesPath(adminId, 'participants');
}

function generateMessageJobDetailsPath(adminId: string, messageJobId: string) {
  return `/admin/${adminId}/mailprotocols/${messageJobId}`;
}

function generateTeamMemberCancellationPath(adminId: string, participant: Participant) {
  if (!participant.teamId) {
    throw new Error(`Cannot generateParticipantCancellationPath for participant ${participant.participantNumber} that has no teamId`);
  }
  return `${generateTeamPath(adminId, participant.teamId)}?${TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM}=${participant.id}`;
}

function generateMessagesPath(adminId: string, messageType: string) {
  return `/admin/${adminId}/${messageType}/messages`;
}

function generateDashboardPath(adminId: string) {
  return `/admin/${adminId}`;
}
export function useAdminNavigation() {

  const history = useHistory();

  function navigateToTeam(adminId: string, teamId: string) {
    history.push(generateTeamPath(adminId, teamId));
  }

  function navigateToTeamMemberCancellation(adminId: string, participant: Participant) {
    history.push(generateTeamMemberCancellationPath(adminId, participant));
  }

  return {
    generateTeamPath,
    navigateToTeam,
    generateTeamMessagesPath,
    generateParticipantMessagesPath,
    generateMessageJobDetailsPath,
    generateTeamMemberCancellationPath,
    navigateToTeamMemberCancellation,
    generateDashboardPath
  };

}


