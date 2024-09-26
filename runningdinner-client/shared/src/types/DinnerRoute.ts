import {AfterPartyLocation, Meal} from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {Participant} from "./Participant";
import {BaseEntity, GeocodingResult, HasGeocoding} from "./Base";
import {filterForValidGeocdingResults} from "../GeocoderHook";

export interface DinnerRoute {
  currentTeam: Team;
  mealSpecificsOfGuestTeams: string;
  teams: DinnerRouteTeam[];
  afterPartyLocation?: AfterPartyLocation;
}

export interface DinnerRouteTeam {
  teamNumber: number;
  status: TeamStatus;
  meal: Meal;
  hostTeamMember: DinnerRouteTeamHost;
  geocodingResult?: GeocodingResult;
  contactInfo: string[];
}

export interface DinnerRouteTeamHost extends Omit<Participant, "id"> {

}

export interface DinnerRouteList {
  dinnerRoutes: DinnerRoute[];
}

export interface GeocodedAddressEntityList {
  addressEntities: GeocodedAddressEntity[];
}
export interface GeocodedAddressEntity extends GeocodingResult, BaseEntity { }

export interface DinnerRouteTeamWithDistance extends DinnerRouteTeam {
  distanceToNextTeam: number;
  currentTeam: boolean;
  largestDistanceInRoute: boolean;
}
export interface DinnerRouteWithDistances {
  teams: DinnerRouteTeamWithDistance[];
}

export interface DinnerRouteWithDistancesList {
  dinnerRoutes: DinnerRouteWithDistances[];
}
interface DistanceEntry {
  srcId: string;
  destId: string;
}

export interface DistanceMatrix {
  entries: Map<DistanceEntry, number>;
}

export interface TeamDistanceCluster {
  teams: Team[];
  distance: number;
}
export interface TeamDistanceClusterList {
  teamDistanceClusters: TeamDistanceCluster[];
}

export type MapEntry = {
  color: string;
  position: GeocodingResult
};

export type TeamConnectionPath = {
  coordinates: GeocodingResult[];
  color: string;
  key: string;
  team: DinnerRouteTeam;
  toTeam?: DinnerRouteTeam;
};

export type DinnerRouteTeamMapEntry = {
  teamConnectionPaths: TeamConnectionPath[];
  mealType: MealType;
} & DinnerRouteTeam & MapEntry;

export type AfterPartyLocationMapEntry = AfterPartyLocation & MapEntry;

export type DinnerRouteMapData = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  showWarnings?: boolean;
  centerPosition: GeocodingResult;
  afterPartyLocationMapEntry?: AfterPartyLocationMapEntry
};

export enum MealType  {
  APPETIZER = "APPETIZER",
  MAIN_COURSE = "MAIN_COURSE",
  DESSERT = "DESSERT"
}

export type TeamDistanceClusterWithMapEntry = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
} & TeamDistanceCluster;

export function isSameDinnerRouteTeam(a: DinnerRouteTeam | Team, b: DinnerRouteTeam | Team) {
 return a.teamNumber === b.teamNumber;
}

export function isDinnerRouteTeam(item: DinnerRouteTeam | AfterPartyLocation): item is DinnerRouteTeam {
  return (item as DinnerRouteTeam).teamNumber !== undefined;
}

export function getGeocodingResultsForTeamsAndAfterPartyLocation(dinnerRouteTeams: DinnerRouteTeam[], afterPartyLocation?: AfterPartyLocation) {
  const geocodedItems: HasGeocoding[] = [... dinnerRouteTeams];
  if (afterPartyLocation) {
    geocodedItems.push(afterPartyLocation);
  }
  return filterForValidGeocdingResults(geocodedItems)
          .map(geocodedItem => geocodedItem.geocodingResult);
}