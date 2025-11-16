import { DinnerRouteList, findAllDinnerRoutesByAdminIdAsync, isStringNotEmpty } from '@runningdinner/shared';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';
import { useIsRouteOptimization } from './useIsRouteOptimization';
// import { queryCalculateTeamDistanceClustersKey } from './useCalculateTeamNeighbourClusters';

export function useFindAllDinnerRoutes(adminId: string) {
  const optimizationId = useIsRouteOptimization();
  const queryClient = useQueryClient();

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const allDinnerRoutes = await findAllDinnerRoutes(adminId, optimizationId);
      // Refer also to https://tkdodo.eu/blog/seeding-the-query-cache
      // TODO: Somehow this loading improvement does not work welll with the optimizationId case, so we do not use it for now...
      // const queryKey = queryCalculateTeamDistanceClustersKey(adminId, 0, optimizationId);
      // queryClient.setQueryData(queryKey, allDinnerRoutes.teamNeighbourClustersSameAddress?.teamNeighbourClusters || []);
      return allDinnerRoutes;
    },
    queryKey: ['findAllDinnerRoutesByAdminId', adminId, optimizationId],
  });
}

async function findAllDinnerRoutes(adminId: string, optimizationId: string | null): Promise<DinnerRouteList> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    return optimizationResult.optimizedDinnerRouteList;
  }
  return findAllDinnerRoutesByAdminIdAsync(adminId);
}
