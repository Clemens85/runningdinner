import { buildAddressEntityIdsQueryKey, buildAddressEntityList, calculateTeamDistanceClusters, DinnerRouteTeam, DinnerRouteTeamMapEntry, GeocodedAddressEntityList, isStringNotEmpty, TeamDistanceCluster } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

export function useCalculateTeamDistanceClusters(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[], range: number) {

  const optimizationId = useIsRouteOptimization();

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateTeamDistanceClusters(adminId, addressEntityList, range, optimizationId),
    queryKey: ['calculateTeamDistanceClusters', adminId, addressEntityIds, range, optimizationId],
    enabled: range >= 0 && addressEntityList.addressEntities?.length > 0
  });
}


async function doCalculateTeamDistanceClusters(adminId: string, 
                                               addressEntityList: GeocodedAddressEntityList, 
                                               range: number, 
                                               optimizationId: string | null): Promise<TeamDistanceCluster[]> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    return optimizationResult.optimizedTeamDistanceClusters.teamDistanceClusters;
  }
  return calculateTeamDistanceClusters(adminId, addressEntityList, range);
}

