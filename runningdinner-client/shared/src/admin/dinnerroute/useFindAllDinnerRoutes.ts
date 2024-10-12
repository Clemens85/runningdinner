import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { findAllDinnerRoutesByAdminIdAsync } from "./DinnerRouteService";

export function useFindAllDinnerRoutes(adminId: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findAllDinnerRoutesByAdminIdAsync(adminId),
    queryKey: ['findAllDinnerRoutesByAdminId', adminId],
  });
}
  