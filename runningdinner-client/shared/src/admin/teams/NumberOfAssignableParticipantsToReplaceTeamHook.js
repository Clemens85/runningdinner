export function useNumberOfAssignableParticipantsToReplaceTeam(runningDinner, team, notAssignedParticipants) {
  const numNotAssignedParticipantsLength = notAssignedParticipants ? notAssignedParticipants.length : 0;

  function _calculateNumberOfMissingParticipantsToReplaceTeam() {
    return runningDinner.options.teamSize - numNotAssignedParticipantsLength;
  }

  function _hasEnoughNotAssignedParticipantsToReplaceTeam(team) {
    // Team to be replaced my already have cancelled team-members (hence use current team size)
    return team.teamMembers.length <= numNotAssignedParticipantsLength;
  }

  const hasEnoughNotAssignedParticipantsToReplaceTeam = _hasEnoughNotAssignedParticipantsToReplaceTeam(team);
  const numberOfMissingParticipantsToReplaceTeam = hasEnoughNotAssignedParticipantsToReplaceTeam ? 0 : _calculateNumberOfMissingParticipantsToReplaceTeam();

  return { numberOfMissingParticipantsToReplaceTeam, hasEnoughNotAssignedParticipantsToReplaceTeam };
}
