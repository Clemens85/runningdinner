import { buildAddressEntityIdsQueryKey, buildAddressEntityList, DinnerRouteTeamMapEntry, predictOptimizationImpact } from "@runningdinner/shared";
import { useQuery } from "@tanstack/react-query";

export function usePredictOptimizationImpact(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[]) {

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);
  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    queryFn: () => predictOptimizationImpact(adminId, addressEntityList),
    queryKey: ['predictOptimizationImpact', adminId, addressEntityIds],
  });
}