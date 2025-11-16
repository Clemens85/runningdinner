import { calculateTeamNeighbourClusters, isStringNotEmpty, TeamNeighbourCluster } from '@runningdinner/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';
import { useIsRouteOptimization } from './useIsRouteOptimization';

export function queryCalculateTeamDistanceClustersKey(adminId: string, range: number, optimizationId: string | null) {
  return ['calculateTeamNeighbourClusters', adminId, range, optimizationId];
}

export function useCalculateTeamNeighbourClusters(adminId: string, range: number) {
  const optimizationId = useIsRouteOptimization();

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateTeamNeighbourClusters(adminId, range, optimizationId),
    queryKey: queryCalculateTeamDistanceClustersKey(adminId, range, optimizationId),
    enabled: range >= 0,
  });
}

async function doCalculateTeamNeighbourClusters(adminId: string, range: number, optimizationId: string | null): Promise<TeamNeighbourCluster[]> {
  let result: TeamNeighbourCluster[];

  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    result = optimizationResult.optimizedTeamNeighbourClusters.teamNeighbourClusters;
  } else {
    result = await calculateTeamNeighbourClusters(adminId, range);
  }
  return result;
}
