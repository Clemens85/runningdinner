import { AfterPartyLocation, DinnerRouteTeam, useGeocoder } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useGetGeocodePositionsOfTeamHosts(dinnerRouteTeams: DinnerRouteTeam[], googleMapsApiKey: string) {

  const { i18n } = useTranslation();
  const {getGeocodePositionsOfTeamHosts} = useGeocoder(googleMapsApiKey, i18n.language);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getGeocodePositionsOfTeamHosts(dinnerRouteTeams),
    queryKey: ['getGeocodePositionsOfTeamHosts', dinnerRouteTeams],
    enabled: dinnerRouteTeams.length > 0,
  });

}

export function useGetGeocodePositionOfAfterPartyLocation(afterPartyLocation: AfterPartyLocation | undefined | null, googleMapsApiKey: string) {
  const { i18n } = useTranslation();
  const {getGeocodePositionOfAfterPartyLocation} = useGeocoder(googleMapsApiKey, i18n.language);

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getGeocodePositionOfAfterPartyLocation(afterPartyLocation),
    queryKey: ['getGeocodePositionOfAfterPartyLocation', afterPartyLocation]
  });
}