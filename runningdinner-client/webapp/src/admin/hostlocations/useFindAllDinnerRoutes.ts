import { DinnerRouteList, findAllDinnerRoutesByAdminIdAsync, isStringNotEmpty } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

export function useFindAllDinnerRoutes(adminId: string) {

  const optimizationId = useIsRouteOptimization();

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => findAllDinnerRoutes(adminId, optimizationId),
    queryKey: ['findAllDinnerRoutesByAdminId', adminId, optimizationId],
  });
}


async function findAllDinnerRoutes(adminId: string, optimizationId: string | null): Promise<DinnerRouteList> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    return {
      dinnerRoutes: optimizationResult.optimizedDinnerRoutes,
    }
  }
  return findAllDinnerRoutesByAdminIdAsync(adminId);
}