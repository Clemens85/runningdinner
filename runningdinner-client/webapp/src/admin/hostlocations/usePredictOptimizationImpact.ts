import { predictOptimizationImpact } from '@runningdinner/shared';
import { useQuery } from '@tanstack/react-query';

export function usePredictOptimizationImpact(adminId: string) {
  return useQuery({
    queryFn: () => predictOptimizationImpact(adminId),
    queryKey: ['predictOptimizationImpact', adminId],
  });
}
