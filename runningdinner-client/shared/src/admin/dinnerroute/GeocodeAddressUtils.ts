import { DinnerRouteTeamMapEntry, DinnerRouteTeam, GeocodedAddressEntityList } from "../..";

export function buildAddressEntityList(dinnerRouteMapEntries: DinnerRouteTeamMapEntry[] | DinnerRouteTeam[]): GeocodedAddressEntityList {
  const addressEntities = dinnerRouteMapEntries.map(entry => ({
    id: mapToGeocodedAddressEntityId(entry),
    lat: entry.geocodingResult?.lat,
    lng: entry.geocodingResult?.lng,
    idType: "TEAM_NR"
  }));
  return {
    addressEntities
  };
}

export function mapToGeocodedAddressEntityId<T extends DinnerRouteTeam>(dinnerRouteTeam: T): string {
  return `${dinnerRouteTeam.teamNumber}`;
}
  
export function buildAddressEntityIdsQueryKey(addressEntityList: GeocodedAddressEntityList): string {
  return addressEntityList.addressEntities
            .map(addressEntity => addressEntity.id || '')
            .sort()
            .join(','); 
}