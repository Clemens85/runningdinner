import { AfterPartyLocation, DinnerRouteTeam, isStringNotEmpty, useGeocoder } from "@runningdinner/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {  DinnerRouteOptimizationResultService, useIsRouteOptimization } from "../../admin/hostlocations";

type GetGeocodePositionsCallback = (dinnerRouteTeams: DinnerRouteTeam[]) => Promise<DinnerRouteTeam[]>;

export function useGetGeocodePositionsOfTeamHosts(dinnerRouteTeams: DinnerRouteTeam[], adminId: string, googleMapsApiKey: string) {

  const { i18n } = useTranslation();
  const {getGeocodePositionsOfTeamHosts} = useGeocoder(googleMapsApiKey, i18n.language);

  const optimizationId = useIsRouteOptimization();
  
  const enabled = dinnerRouteTeams.length > 0;

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => doGetGeocodePositionsOfTeamHosts(getGeocodePositionsOfTeamHosts, dinnerRouteTeams, adminId, optimizationId),
    queryKey: ['getGeocodePositionsOfTeamHosts', dinnerRouteTeams, adminId, optimizationId],
    enabled,
  });
}
async function doGetGeocodePositionsOfTeamHosts(getGeocodePositionsOfTeamHosts: GetGeocodePositionsCallback,
                                                dinnerRouteTeams: DinnerRouteTeam[], 
                                                adminId: string,
                                                optimizationId: string | null): Promise<DinnerRouteTeam[]> {
  if (isStringNotEmpty(optimizationId)) {
    const optimizationResult = DinnerRouteOptimizationResultService.findDinnerRouteOptimizationResult(optimizationId, adminId);
    const dinnerRouteTeams = optimizationResult.optimizedDinnerRoutes
                                                  .map(route => route.teams)
                                                  .flat();
    for (const dinnerRouteTeam of dinnerRouteTeams) {
      dinnerRouteTeam.geocodingResult = dinnerRouteTeam.hostTeamMember.geocodingResult;
    }
    return dinnerRouteTeams;
  }
  return getGeocodePositionsOfTeamHosts(dinnerRouteTeams);
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