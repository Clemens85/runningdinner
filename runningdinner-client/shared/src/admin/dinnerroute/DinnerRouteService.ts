import axios from 'axios';
import { BackendConfig } from '../../BackendConfig';
import {
  DinnerRoute,
  DinnerRouteList,
  TeamNeighbourCluster,
  TeamNeighbourClusterList,
  DinnerRouteWithDistancesList,
  DinnerRouteOptimizationResult,
  CalculateDinnerRouteOptimizationRequest,
  OptimizationImpact,
  SaveDinnerRouteOptimizationRequest,
} from '../../types';

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

export async function calculateTeamNeighbourClusters(adminId: string, range: number): Promise<TeamNeighbourCluster[]> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/${range}/teams`);
  const response = await axios.get<TeamNeighbourClusterList>(url);
  return response.data?.teamNeighbourClusters || [];
}

export async function calculateRouteDistances(adminId: string): Promise<DinnerRouteWithDistancesList> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/teams`);
  const response = await axios.get<DinnerRouteWithDistancesList>(url);
  const result = response.data;
  return result;
}

export async function calculateOptimizationClusters(adminId: string, calculateRequest: CalculateDinnerRouteOptimizationRequest): Promise<DinnerRouteOptimizationResult> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/optimization`);
  const response = await axios.put<DinnerRouteOptimizationResult>(url, calculateRequest);
  return response.data;
}

export async function saveNewDinnerRoutes(adminId: string, saveRequest: SaveDinnerRouteOptimizationRequest): Promise<void> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/teams`);
  await axios.put(url, saveRequest);
}

export async function predictOptimizationImpact(adminId: string): Promise<OptimizationImpact> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/distances/optimization/predict`);
  const response = await axios.get<OptimizationImpact>(url);
  return response.data;
}
