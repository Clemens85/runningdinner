import axios from 'axios';
import { BackendConfig } from '../../BackendConfig';
import {
  DinnerRoute,
  DinnerRouteList,
  TeamNeighbourCluster,
  TeamNeighbourClusterList,
  DinnerRouteWithDistancesList,
  CalculateDinnerRouteOptimizationRequest,
  OptimizationImpact,
  CalculateDinnerRouteOptimizationResponse,
  DinnerRouteOptimizationResult,
  DinnerRouteOptimizationStatus,
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

export async function createRouteOptimizationCalculation(
  adminId: string,
  calculateRequest: CalculateDinnerRouteOptimizationRequest,
): Promise<CalculateDinnerRouteOptimizationResponse> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/optimization`);
  const response = await axios.post<CalculateDinnerRouteOptimizationResponse>(url, calculateRequest);
  return response.data;
}

export async function findRouteOptimizationPreview(adminId: string, optimizationId: string): Promise<DinnerRouteOptimizationResult> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/optimization/${optimizationId}/preview`);
  const response = await axios.get<DinnerRouteOptimizationResult>(url);
  const result = response.data;
  return result;
}

export async function findRouteOptimizationStatus(adminId: string, optimizationId: string): Promise<DinnerRouteOptimizationStatus> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/optimization/${optimizationId}/status`);
  const response = await axios.get<DinnerRouteOptimizationStatus>(url);
  const result = response.data;
  return result;
}

export function buildOptimizationNotificationSubscriptionUrl(adminId: string, optimizationId: string): string {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/${optimizationId}/subscribe`);
  const result = url.replace('/rest/', '/sse/'); // Adjust URL for SSE
  return result;
}

export async function saveOptimizedDinnerRoutes(adminId: string, optimizationId: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/optimization/${optimizationId}`);
  await axios.put(url);
}

export async function predictOptimizationImpact(adminId: string): Promise<OptimizationImpact> {
  const url = BackendConfig.buildUrl(`/dinnerrouteservice/v1/runningdinner/${adminId}/optimization/predict`);
  const response = await axios.get<OptimizationImpact>(url);
  return response.data;
}
