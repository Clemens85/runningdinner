import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { findParticipantsAsync } from '..';

export function useFindParticipants(adminId: string, refetchOnMount?: boolean | 'always' | undefined) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findParticipantsAsync(adminId),
    queryKey: ['findParticipants', adminId],
    refetchOnMount: refetchOnMount,
  });
}

export function useFindParticipantsListMandatory(adminId: string) {
  const { data } = useFindParticipants(adminId);
  if (!data) {
    throw 'ParticipantList must be loaded, but was not!';
  }
  return data;
}
