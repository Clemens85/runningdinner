import axios from "axios";
import { BackendConfig } from "../../BackendConfig";
import { DinnerRoute, DinnerRouteAddressEntityList, DinnerRouteList, DistanceMatrix } from "../../types";

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

export async function findDistanceMatrix(adminId: string, addressEntityList: DinnerRouteAddressEntityList): Promise<DistanceMatrix> {

  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances`);
  const response = await axios.put(url, addressEntityList);
  return response.data;
}