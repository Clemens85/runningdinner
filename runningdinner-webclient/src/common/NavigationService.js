
export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";

function generateTeamPath(adminId, teamId) {
  return `/admin/${adminId}/teams/${teamId}`;
}
function generateTeamMessagesPath(adminId) {
  return `/admin/${adminId}/teams/messages`;
}
function generateParticipantCancellationPath(adminId, participant) {
  return `${generateTeamPath(adminId, participant.teamId)}?${TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM}=${participant.id}`;
}

export {
  generateTeamPath,
  generateTeamMessagesPath,
  generateParticipantCancellationPath
};
