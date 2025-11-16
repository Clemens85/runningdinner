import { calculateRouteDistances, DinnerRouteWithDistancesList, isStringNotEmpty } from '@runningdinner/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DinnerRouteOptimizationResultService } from './DinnerRouteOptimizationResultService';
import { useIsRouteOptimization } from './useIsRouteOptimization';

export function useCalculateRouteDistances(adminId: string) {
  const optimizationId = useIsRouteOptimization();

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doCalculateRouteDistances(adminId, optimizationId),
    queryKey: ['calculateRouteDistances', adminId, optimizationId],
  });
}

async function doCalculateRouteDistances(adminId: string, optimizationId: string | null): Promise<DinnerRouteWithDistancesList> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    return optimizationResult.optimizedDistances;
  }
  return calculateRouteDistances(adminId);
}
