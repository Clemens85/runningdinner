import axios from "axios";
import { BackendConfig } from "../../BackendConfig";
import { DinnerRoute, GeocodedAddressEntityList, DinnerRouteList, TeamDistanceCluster, TeamDistanceClusterList, DinnerRouteWithDistances, DinnerRouteWithDistancesList } from "../../types";

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

export async function calculateRouteDistances(adminId: string, addressEntityList: GeocodedAddressEntityList): Promise<DinnerRouteWithDistances[]> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/teams`);
  const response = await axios.put<DinnerRouteWithDistancesList>(url, addressEntityList);
  return response.data?.dinnerRoutes || [];
}
