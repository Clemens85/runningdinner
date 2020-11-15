
export const TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM = "teamMemberIdToCancel";

export function generateTeamPath(adminId, teamId) {
  return `/admin/${adminId}/teams/${teamId}`;
}

export function generateParticipantCancellationPath(adminId, participant) {
  return `${generateTeamPath(adminId, participant.teamId)}?${TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM}=${participant.id}`;
}

