import { buildAddressEntityIdsQueryKey, buildAddressEntityList, calculateTeamDistanceClusters, DinnerRouteTeam, DinnerRouteTeamMapEntry, GeocodedAddressEntityList, isStringNotEmpty, TeamDistanceCluster, TeamDistanceClusterEnhancer, TeamDistanceClusterWithMapEntry } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

export function useCalculateTeamDistanceClusters(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[], range: number) {

  const optimizationId = useIsRouteOptimization();

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateTeamDistanceClusters(adminId, addressEntityList, dinnerRouteMapEntries, range, optimizationId),
    queryKey: ['calculateTeamDistanceClusters', adminId, addressEntityIds, range, optimizationId],
    enabled: range >= 0 && addressEntityList.addressEntities?.length > 0
  });
}


async function doCalculateTeamDistanceClusters(adminId: string, 
                                               addressEntityList: GeocodedAddressEntityList, 
                                               dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[],
                                               range: number, 
                                               optimizationId: string | null): Promise<TeamDistanceClusterWithMapEntry[]> {

  let result: TeamDistanceCluster[];

  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    result = optimizationResult.optimizedTeamDistanceClusters.teamDistanceClusters;
  } else {
    result = await calculateTeamDistanceClusters(adminId, addressEntityList, range);
  }

  // We can only enhance with type of DinnerRouteTeamMapEntry, if we have a list of DinnerRouteTeamMapEntries
  if (isArrayWithDinnerRouteTeamMapEntries(dinnerRouteMapEntries)) {
    return TeamDistanceClusterEnhancer.enhanceTeamDistanceClustersWithDinnerRouteMapEntries(result, dinnerRouteMapEntries);
  }
  return TeamDistanceClusterEnhancer.enhanceTeamDistanceClustersWithDinnerRouteMapEntries(result, []);
}

function isArrayWithDinnerRouteTeamMapEntries(entries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[]): entries is DinnerRouteTeamMapEntry[] {
  if (entries.length === 0) {
    return false;
  }
  const firstEntry = entries[0];
  return firstEntry.hasOwnProperty('mealType');
}
