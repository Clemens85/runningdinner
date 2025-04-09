import axios from "axios";
import { BackendConfig } from "../../BackendConfig";
import { DinnerRoute, GeocodedAddressEntityList, DinnerRouteList, TeamDistanceCluster, TeamDistanceClusterList, DinnerRouteWithDistances, DinnerRouteWithDistancesList, DinnerRouteOptimizationResult } from "../../types";
import { findEntityById } from "../..";
import { mapToGeocodedAddressEntityId } from "./GeocodeAddressUtils";


export async function findDinnerRouteByAdminIdAndTeamIdAsync(adminId: string, teamId: string): Promise<DinnerRoute> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/teams/${teamId}`);
  const response = await axios.get(url);
  return response.data;
}

export async function findAllDinnerRoutesByAdminIdAsync(adminId: string): Promise<DinnerRouteList> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/teams`);
  const response = await axios.get(url);
  return response.data;
}

export async function calculateTeamDistanceClusters(adminId: string, addressEntityList: GeocodedAddressEntityList, range: number): Promise<TeamDistanceCluster[]> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/${range}/teams`);
  const response = await axios.put<TeamDistanceClusterList>(url, addressEntityList);
  return response.data?.teamDistanceClusters || [];
}

export async function calculateRouteDistances(adminId: string, addressEntityList: GeocodedAddressEntityList): Promise<DinnerRouteWithDistancesList> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/teams`);
  const response = await axios.put<DinnerRouteWithDistancesList>(url, addressEntityList);
  const result = response.data;
  enrichDinnerRoutesWithGeocodingResults(result.dinnerRoutes || [], addressEntityList);
  return result;
}

function enrichDinnerRoutesWithGeocodingResults(dinnerRouteWithDistances: DinnerRouteWithDistances[], 
                                                addressEntityList: GeocodedAddressEntityList) {

  for (const route of dinnerRouteWithDistances) {
    for (let i = 0; i < route.teams.length; i++) {
      const team = route.teams[i];
      const geocodingResult = findEntityById(addressEntityList.addressEntities, mapToGeocodedAddressEntityId(team));
      if (geocodingResult) {
        team.geocodingResult = geocodingResult;
      }
    }
  }
  return dinnerRouteWithDistances;
}

export async function calculateOptimizationClusters(adminId: string, addressEntityList: GeocodedAddressEntityList): Promise<DinnerRouteOptimizationResult> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/optimization`);
  const response = await axios.put<DinnerRouteOptimizationResult>(url, addressEntityList);
  return response.data;
}

export async function saveNewDinnerRoutes(adminId: string, dinnerRouteList: DinnerRouteList): Promise<void> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/teams`);
  await axios.put(url, dinnerRouteList);
}