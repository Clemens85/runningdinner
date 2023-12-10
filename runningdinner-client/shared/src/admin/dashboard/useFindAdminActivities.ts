import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enhanceAdminActivitiesByDetailsAsync, findAdminActivitiesByAdminIdAsync } from "..";
import { isDefined } from "../..";

export function useFindAdminActivitiesByAdminId(adminId: string) {
  const result =  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findAdminActivitiesByAdminIdAsync(adminId),
    queryKey: ['findAdminActivitiesByAdminId', adminId],
    refetchOnMount: 'always'
  });

  useQuery({
    placeholderData: keepPreviousData,
    enabled: isDefined(result.data),
    queryFn: () => enhanceAdminActivitiesByDetailsAsync(adminId, result.data!),
    queryKey: ['enhanceAdminActivitiesByDetails', adminId, result.data],
  });

  return result;
}
