import { findAllDinnerRoutesByAdminIdAsync } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useFindAllDinnerRoutes(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findAllDinnerRoutesByAdminIdAsync(adminId),
    queryKey: ['findAllDinnerRoutesByAdminI', adminId],
  });
}
  