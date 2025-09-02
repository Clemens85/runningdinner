import { AfterPartyLocation } from './RunningDinner';
import { BaseTeam, Team } from './Team';
import { Participant } from './Participant';
import { GeocodingResult } from './Base';

export interface DinnerRoute {
  currentTeam: Team;
  mealSpecificsOfGuestTeams: string;
  teams: DinnerRouteTeam[];
  afterPartyLocation?: AfterPartyLocation;
}

export type DinnerRouteTeam = {
  hostTeamMember: DinnerRouteTeamHost;
  contactInfo: string[];
} & BaseTeam;

export interface DinnerRouteTeamHost extends Omit<Participant, 'id'> {}

export interface DinnerRouteList {
  dinnerRoutes: DinnerRoute[];
  teamClusterMappings: Record<number, number[]>;
  teamNeighbourClustersSameAddress: TeamNeighbourClusterList;
}

export interface DinnerRouteTeamWithDistance extends DinnerRouteTeam {
  distanceToNextTeam: number;
  currentTeam: boolean;
  largestDistanceInRoute: boolean;
}
export interface DinnerRouteWithDistances {
  teams: DinnerRouteTeamWithDistance[];
  averageDistanceInMeters: number;
}

export interface RouteDistanceMetrics {
  averageDistanceInMeters: number;
  sumDistanceInMeters: number;
}

export interface DinnerRouteWithDistancesList extends RouteDistanceMetrics {
  dinnerRoutes: DinnerRouteWithDistances[];
}

interface DistanceEntry {
  srcId: string;
  destId: string;
}

export interface DistanceMatrix {
  entries: Map<DistanceEntry, number>;
}

export interface TeamNeighbourCluster {
  a: Team;
  b: Team;
  distance: number;
}
export interface TeamNeighbourClusterList {
  teamNeighbourClusters: TeamNeighbourCluster[];
}

export type MapEntry = {
  color: string;
  position: GeocodingResult;
  secondaryClusterColor?: string;
};

export type TeamConnectionPath = {
  coordinates: GeocodingResult[];
  color: string;
  secondaryClusterColor?: string;
  key: string;
  team: DinnerRouteTeam;
  toTeam?: DinnerRouteTeam;
};

export type DinnerRouteTeamMapEntry = {
  teamConnectionPaths: TeamConnectionPath[];
  mealType: MealType;
} & DinnerRouteTeam &
  MapEntry;

export type AfterPartyLocationMapEntry = AfterPartyLocation & MapEntry;

export type DinnerRouteMapData = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  teamsWithUnresolvedGeocodings: DinnerRouteTeam[];
  centerPosition: GeocodingResult;
  afterPartyLocationMapEntry?: AfterPartyLocationMapEntry;
  numberOfClusters: number;
};

export type TeamMemberChange = {
  currentTeamId: string;
  moveTeamMembersFromTeamId: string;
};

export type DinnerRouteOptimizationResult = {
  id: string;
  optimizedDinnerRouteList: DinnerRouteList;
  optimizedDistances: DinnerRouteWithDistancesList;
  optimizedTeamNeighbourClusters: TeamNeighbourClusterList;
  averageDistanceInMetersBefore: number;
  sumDistanceInMetersBefore: number;
};

export type DinnerRouteOptimizationStatus = {
  optimizationId: string;
  status: 'RUNNING' | 'FINISHED' | 'TIMEOUT';
};

export type CalculateDinnerRouteOptimizationRequest = {
  currentSumDistanceInMeters: number;
  currentAverageDistanceInMeters: number;
};

export type CalculateDinnerRouteOptimizationResponse = {
  optimizationId: string;
};

export enum MealType {
  APPETIZER = 'APPETIZER',
  MAIN_COURSE = 'MAIN_COURSE',
  DESSERT = 'DESSERT',
}

export type TeamNeighbourClusterWithMapEntry = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
} & TeamNeighbourCluster;

export function isSameDinnerRouteTeam(a: DinnerRouteTeam | Team, b: DinnerRouteTeam | Team) {
  return a.teamNumber === b.teamNumber;
}

export function isDinnerRouteTeam(item: DinnerRouteTeam | AfterPartyLocation): item is DinnerRouteTeam {
  return (item as DinnerRouteTeam).teamNumber !== undefined;
}

export type OptimizationImpact = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
