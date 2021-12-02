import {isArrayNotEmpty, MessageTeamsType, Participant, Team} from "@runningdinner/shared";
import {useHistory} from "react-router-dom";

export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";
export const SELECTED_TEAM_IDS_QUERY_PARAM = "selectedTeamIds";
export const MESSAGE_TEAMS_TYPE_QUERY_PARAM = "messageTeamsType";

function generateTeamPath(adminId: string, teamId: string) {
  return `/admin/${adminId}/teams/${teamId}`;
}

function generateParticipantPath(adminId: string, participantId: string) {
  return `/admin/${adminId}/participants/${participantId}`;
}

function generateTeamMessagesPath(adminId: string, messageTeamsType?: MessageTeamsType, teamsToSelect?: Team[]) {
  let result = generateMessagesPath(adminId, 'teams');
  let queryParamSeparator = "?";
  if (isArrayNotEmpty(teamsToSelect)) {
    const selectedTeamIds = teamsToSelect.map(t => t.id).join(',');
    result = `${result}${queryParamSeparator}${SELECTED_TEAM_IDS_QUERY_PARAM}=${selectedTeamIds}`;
    queryParamSeparator = "&";
  }
  if (messageTeamsType) {
    result = `${result}${queryParamSeparator}messageTeamsType=${messageTeamsType}`;
  }
  return result;
}
function generateParticipantMessagesPath(adminId: string) {
  return generateMessagesPath(adminId, 'participants');
}
function generateDinnerRouteMessagesPath(adminId: string) {
  return generateMessagesPath(adminId, 'dinnerroute');
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

function generateTeamDinnerRoutePath(adminId: string, teamId: string) {
  return `${generateTeamPath(adminId, teamId)}/dinnerroute`;
}

export function useAdminNavigation() {

  const history = useHistory();

  function navigateToTeam(adminId: string, teamId: string) {
    history.push(generateTeamPath(adminId, teamId));
  }

  function navigateToTeamMemberCancellation(adminId: string, participant: Participant) {
    history.push(generateTeamMemberCancellationPath(adminId, participant));
  }

  function navigateToTeamMessages(adminId: string, messageTeamsType: MessageTeamsType = MessageTeamsType.DEFAULT, teamsToSelect?: Team[]) {
    history.push(generateTeamMessagesPath(adminId, messageTeamsType, teamsToSelect));
  }

  function navigateToDinnerRouteMessages(adminId: string) {
    history.push(generateDinnerRouteMessagesPath(adminId));
  }

  function navigateToParticipant(adminId: string, participantId: string) {
    history.push(generateParticipantPath(adminId, participantId));
  }

  return {
    generateTeamPath,
    navigateToTeam,
    generateParticipantMessagesPath,
    generateMessageJobDetailsPath,
    navigateToTeamMemberCancellation,
    generateDashboardPath,
    generateTeamDinnerRoutePath,
    navigateToTeamMessages,
    navigateToDinnerRouteMessages,
    navigateToParticipant
  };

}


