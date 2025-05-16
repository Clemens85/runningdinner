import { buildAddressEntityIdsQueryKey, buildAddressEntityList, calculateTeamNeighbourClusters, DinnerRouteTeam, DinnerRouteTeamMapEntry, GeocodedAddressEntityList, isStringNotEmpty, TeamNeighbourCluster } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsRouteOptimization } from "./useIsRouteOptimization";
import { DinnerRouteOptimizationResultService } from "./DinnerRouteOptimizationResultService";

export function useCalculateTeamNeighbourClusters(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[], range: number) {

  const optimizationId = useIsRouteOptimization();

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateTeamNeighbourClusters(adminId, addressEntityList, range, optimizationId),
    queryKey: ['calculateTeamDistanceClusters', adminId, addressEntityIds, range, optimizationId],
    enabled: range >= 0 && addressEntityList.addressEntities?.length > 0
  });
}


async function doCalculateTeamNeighbourClusters(adminId: string, 
                                                addressEntityList: GeocodedAddressEntityList, 
                                                range: number, 
                                                optimizationId: string | null): Promise<TeamNeighbourCluster[]> {

  let result: TeamNeighbourCluster[];

  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    result = optimizationResult.optimizedTeamNeighbourClusters.teamNeighbourClusters;
  } else {
    result = await calculateTeamNeighbourClusters(adminId, addressEntityList, range);
  }
  return result;
}


