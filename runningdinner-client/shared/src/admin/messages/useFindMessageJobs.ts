import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageType, isArrayEmpty } from "../..";
import { findMessageJobsByAdminIdAndTypeAsync, isOneMessageJobNotFinished } from "../MessageService";

export function useFindMessageJobs(adminId: string, messageType: MessageType) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findMessageJobsByAdminIdAndTypeAsync(adminId, messageType),
    queryKey: ["findMessageJobsByAdminIdAndType", adminId, messageType],
    refetchOnMount: 'always',
    refetchInterval: (query) => {

      const THREE_SECONDS = 1000 * 3;

      if (query.state.status === 'error') {
        return false;
      }
      if (query.state.status !== 'success') {
        return THREE_SECONDS;
      }

      const messageJobs = query.state.data || [];
      if (isArrayEmpty(messageJobs) || !isOneMessageJobNotFinished(messageJobs)) {
        return false;
      }
      // At least one jobs is not finished, so we keep polling
      return THREE_SECONDS;
    }
  });
}