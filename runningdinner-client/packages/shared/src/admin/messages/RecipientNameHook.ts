import { getFullname } from "../ParticipantService";
import { isTeam } from "../TeamService";
import useTeamNameMembers from "../teams/TeamNameMembersHook";
import {Participant, Team} from "../../types";

function useRecipientName(recipient: Participant | Team) {

  const {getTeamNameMembers} = useTeamNameMembers();

  function getRecipientName(recipient: Participant | Team): string {
    if (isTeam(recipient)) {
      return getTeamNameMembers(recipient);
    }
    return getFullname(recipient);
  }

  const recipientName = recipient ? getRecipientName(recipient) : undefined;

  return { recipientName, getRecipientName };
}

export default useRecipientName;



