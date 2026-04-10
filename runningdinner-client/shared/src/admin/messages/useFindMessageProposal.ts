import { useQuery } from '@tanstack/react-query';

import { MessageType } from '../../types';
import { findMessageProposalAsync } from '../MessageService';

export function useFindMessageProposal(adminId: string, messageType: MessageType) {
  return useQuery({
    queryFn: () => findMessageProposalAsync(adminId, messageType),
    queryKey: ['findMessageProposal', adminId, messageType],
    retry: false,
  });
}
