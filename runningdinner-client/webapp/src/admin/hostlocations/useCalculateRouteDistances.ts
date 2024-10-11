import { calculateRouteDistances, DinnerRouteTeam, DinnerRouteTeamMapEntry } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { buildAddressEntityIdsQueryKey, buildAddressEntityList } from "./useCalculateTeamDistanceClusters";

export function useCalculateRouteDistances(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[]) {

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);

  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => calculateRouteDistances(adminId, addressEntityList),
    queryKey: ['calculateRouteDistances', adminId, addressEntityIds],
    enabled: addressEntityList.addressEntities?.length > 0
  });
}

  