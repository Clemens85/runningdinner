import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageType } from "../..";
import { findMessageJobsByAdminIdAndTypeAsync } from "../MessageService";

export function useFindMessageJobs(adminId: string, messageType: MessageType) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findMessageJobsByAdminIdAndTypeAsync(adminId, messageType),
    queryKey: ["findMessageJobsByAdminIdAndType", adminId, messageType],
  });
}
