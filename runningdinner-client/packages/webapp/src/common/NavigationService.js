
export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";

function generateTeamPath(adminId, teamId) {
  return `/admin/${adminId}/teams/${teamId}`;
}

function generateTeamMessagesPath(adminId) {
  return generateMessagesPath(adminId, 'teams');
}
function generateParticipantMessagesPath(adminId) {
  return generateMessagesPath(adminId, 'participants');
}

function generateMessageJobDetailsPath(adminId, messageJobId) {
  return `/admin/${adminId}/mailprotocols/${messageJobId}`;
}

function generateParticipantCancellationPath(adminId, participant) {
  return `${generateTeamPath(adminId, participant.teamId)}?${TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM}=${participant.id}`;
}

function generateMessagesPath(adminId, messageType) {
  return `/admin/${adminId}/${messageType}/messages`;
}


export {
  generateTeamPath,
  generateTeamMessagesPath,
  generateParticipantMessagesPath,
  generateMessageJobDetailsPath,
  generateParticipantCancellationPath
};
