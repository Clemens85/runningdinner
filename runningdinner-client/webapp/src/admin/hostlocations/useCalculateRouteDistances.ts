import { DinnerRouteTeamMapEntry, DinnerRouteTeam, calculateRouteDistances, buildAddressEntityList, buildAddressEntityIdsQueryKey, GeocodedAddressEntityList, DinnerRouteWithDistancesList, isStringNotEmpty } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

export function useCalculateRouteDistances(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[]) {

  const optimizationId = useIsRouteOptimization();

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateRouteDistances(adminId, addressEntityList, optimizationId),
    queryKey: ['calculateRouteDistances', adminId, addressEntityIds, optimizationId],
    enabled: addressEntityList.addressEntities?.length > 0
  });
}

async function doCalculateRouteDistances(adminId: string, addressEntityList: GeocodedAddressEntityList, optimizationId: string | null): Promise<DinnerRouteWithDistancesList> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    return optimizationResult.optimizedDistances;
  }
  return calculateRouteDistances(adminId, addressEntityList);
}