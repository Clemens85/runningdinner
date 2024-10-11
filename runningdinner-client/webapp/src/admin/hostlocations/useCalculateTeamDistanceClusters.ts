import { calculateTeamDistanceClusters, DinnerRouteTeam, DinnerRouteTeamMapEntry, GeocodedAddressEntityList } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useCalculateTeamDistanceClusters(adminId: string, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[], range: number) {

  const addressEntityList = buildAddressEntityList(dinnerRouteMapEntries);

  const addressEntityIds = buildAddressEntityIdsQueryKey(addressEntityList);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => calculateTeamDistanceClusters(adminId, addressEntityList, range),
    queryKey: ['calculateTeamDistanceClusters', adminId, addressEntityIds, range],
    enabled: range >= 0 && addressEntityList.addressEntities?.length > 0
  });
}

export function buildAddressEntityList(dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[]): GeocodedAddressEntityList {
  const addressEntities = dinnerRouteMapEntries.map(entry => ({
    id: `${entry.teamNumber}`,
    lat: entry.geocodingResult?.lat,
    lng: entry.geocodingResult?.lng,
    idType: "TEAM_NR"
  }));
  return {
    addressEntities
  };
}
  
export function buildAddressEntityIdsQueryKey(addressEntityList: GeocodedAddressEntityList): string {
  return addressEntityList.addressEntities
            .map(addressEntity => addressEntity.id || '')
            .sort()
            .join(','); 
}