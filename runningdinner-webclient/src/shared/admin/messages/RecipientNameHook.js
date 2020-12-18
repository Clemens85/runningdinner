import ParticipantService from "shared/admin/ParticipantService";
import useTeamNameMembers from "shared/admin/teams/TeamNameMembersHook";
import TeamService from "shared/admin/TeamService";

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



