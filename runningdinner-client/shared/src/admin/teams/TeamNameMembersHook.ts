import { Team } from "../../types";
import { getFullnameList } from "../ParticipantService";
import { useTeamName } from "./TeamNameHook";

export function useTeamNameMembers(team?: Team) {

  const {getTeamName} = useTeamName();

  function getTeamNameMembers(team: Team): string {
    const teamName = getTeamName(team);
    const teamMembers = getFullnameList(team.teamMembers);
    return `${teamName} (${teamMembers})`;
  }

  const teamNameMembers = team ? getTeamNameMembers(team) : undefined;

  return { teamNameMembers, getTeamNameMembers };
}

