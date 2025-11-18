import { Participant, Recipient, Team } from '../../types';
import { getFullname } from '../ParticipantService';
import { useTeamNameMembers } from '../teams/TeamNameMembersHook';
import { isTeam } from '../TeamService';

export function useRecipientName(recipient?: Recipient) {
  const { getTeamNameMembers } = useTeamNameMembers();

  function getRecipientName(recipient: Participant | Team): string {
    if (isTeam(recipient)) {
      return getTeamNameMembers(recipient);
    }
    return getFullname(recipient);
  }

  const recipientName = recipient ? getRecipientName(recipient) : undefined;

  return { recipientName, getRecipientName };
}
