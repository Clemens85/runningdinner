import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { findPublicRunningDinnerByPublicId } from './PublicDinnerEventService';

export function useFindPublicDinner(publicId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findPublicRunningDinnerByPublicId(publicId),
    queryKey: ['findPublicRunningDinnerByPublicId', publicId],
  });
}
