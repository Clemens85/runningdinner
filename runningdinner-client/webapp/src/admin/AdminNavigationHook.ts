import {isArrayNotEmpty, isStringNotEmpty, MessageSubType, Participant, Team} from "@runningdinner/shared";
import {useNavigate} from "react-router-dom";

export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";
export const OPEN_DROP_TEAMS_DIALOG_QUERY_PARAM = "showDropTeamsDialog";
export const SELECTED_TEAM_IDS_QUERY_PARAM = "selectedTeamIds";
export const MESSAGE_SUBTYPE_QUERY_PARAM = "messageSubType";

function generateTeamPath(adminId: string, teamId?: string) {
  return `/admin/${adminId}/teams/${isStringNotEmpty(teamId) ? teamId : ''}`;
}

function generateDropTeamsPath(adminId: string) {
  return `/admin/${adminId}/teams/?${OPEN_DROP_TEAMS_DIALOG_QUERY_PARAM}=true`;
}

function generateParticipantPath(adminId: string, participantId: string) {
  return `/admin/${adminId}/participants/${participantId}`;
}

function generateTeamMessagesPath(adminId: string, messageSubType?: MessageSubType, teamsToSelect?: Team[]) {
  let result = generateMessagesPath(adminId, 'teams');
  let queryParamSeparator = "?";
  if (isArrayNotEmpty(teamsToSelect)) {
    const selectedTeamIds = teamsToSelect.map(t => t.id).join(',');
    result = `${result}${queryParamSeparator}${SELECTED_TEAM_IDS_QUERY_PARAM}=${selectedTeamIds}`;
    queryParamSeparator = "&";
  }
  if (messageSubType) {
    result = `${result}${queryParamSeparator}${MESSAGE_SUBTYPE_QUERY_PARAM}=${messageSubType}`;
  }
  return result;
}
function generateParticipantMessagesPath(adminId: string, messageSubType: MessageSubType = MessageSubType.DEFAULT) {
  let result = generateMessagesPath(adminId, 'participants');
  result = `${result}?${MESSAGE_SUBTYPE_QUERY_PARAM}=${messageSubType}`;
  return result;
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

  const navigate = useNavigate();

  function navigateToTeam(adminId: string, teamId?: string) {
    navigate(generateTeamPath(adminId, teamId));
  }

  function navigateToTeamMemberCancellation(adminId: string, participant: Participant) {
    navigate(generateTeamMemberCancellationPath(adminId, participant));
  }

  function navigateToTeamMessages(adminId: string, messageTeamsType: MessageSubType = MessageSubType.DEFAULT, teamsToSelect?: Team[]) {
    navigate(generateTeamMessagesPath(adminId, messageTeamsType, teamsToSelect));
  }

  function navigateToParticipantMessages(adminId: string, messageTeamsType: MessageSubType = MessageSubType.DEFAULT) {
    navigate(generateParticipantMessagesPath(adminId, messageTeamsType));
  }

  function navigateToDinnerRouteMessages(adminId: string) {
    navigate(generateDinnerRouteMessagesPath(adminId));
  }

  function navigateToParticipant(adminId: string, participantId: string) {
    navigate(generateParticipantPath(adminId, participantId));
  }

  return {
    generateTeamPath,
    generateDropTeamsPath,
    navigateToTeam,
    generateParticipantMessagesPath,
    generateTeamMessagesPath,
    generateMessageJobDetailsPath,
    navigateToTeamMemberCancellation,
    generateDashboardPath,
    generateTeamDinnerRoutePath,
    navigateToParticipantMessages,
    navigateToTeamMessages,
    navigateToDinnerRouteMessages,
    generateParticipantPath,
    navigateToParticipant
  };

}


