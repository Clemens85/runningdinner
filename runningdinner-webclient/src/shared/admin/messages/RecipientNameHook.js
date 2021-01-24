import ParticipantService from "../ParticipantService";
import useTeamNameMembers from "../teams/TeamNameMembersHook";
import TeamService from "../TeamService";

function useRecipientName(recipient) {

  const {getTeamNameMembers} = useTeamNameMembers();

  function getRecipientName(recipient) {
    if (TeamService.isTeam(recipient)) {
      return getTeamNameMembers(recipient);
    }
    return ParticipantService.getFullname(recipient);
  }

  const recipientName = recipient ? getRecipientName(recipient) : undefined;

  return { recipientName, getRecipientName };
}

export default useRecipientName;



