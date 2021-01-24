import useTeamName from "./TeamNameHook";
import ParticipantService from "../ParticipantService";

function useTeamNameMembers(team) {

  const {getTeamName} = useTeamName();

  function getTeamNameMembers(team) {
    const teamName = getTeamName(team);
    const teamMembers = ParticipantService.getFullnameList(team.teamMembers);
    return `${teamName} (${teamMembers})`;
  }

  const teamNameMembers = team ? getTeamNameMembers(team) : undefined;

  return { teamNameMembers, getTeamNameMembers };
}

export default useTeamNameMembers;



