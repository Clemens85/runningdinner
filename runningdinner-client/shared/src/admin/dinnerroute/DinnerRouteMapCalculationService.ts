import { uniqBy } from "lodash-es";
import { isGeocodingResultValid } from "../../GeocoderHook";
import { AfterPartyLocation, DinnerRoute, DinnerRouteTeam, GeocodingResult, Meal, TeamDistanceCluster } from "../../types";
import { isDefined, isStringNotEmpty, stringToColor } from "../../Utils";
import { getFullname } from "../ParticipantService";

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

export type DinnerRouteMapDataCalculationSettings = {
  /**
   * The dinner routes for which to claculate the map data
   */
  allDinnerRoutes: DinnerRoute[], 

  /**
   * The resolved geocodes for all teams within the dinner routes
   */
  dinnerRouteTeamsWithGeocodes: DinnerRouteTeam[] | undefined, 

  /**
   * After Party Location (if used)
   */
  afterPartyLocation: AfterPartyLocation | null,

  /**
   * Provides the team-clusters that cook on the same addres (this may be reasonable to offset the markers on the map)
   */
  teamClustersWithSameAddress: TeamDistanceCluster[];

  /**
   * All meals of the running dinner event
   */
  meals: Meal[];
}


const AFTER_PARTY_LOCATION_COLOR = '#999';
const CURRENT_TEAM_COLOR_SINGLE_ROUTE_VIEW = '#2e7d32';
const GUEST_TEAM_COLOR_SINGLE_ROUTE_VIEW = '#999';


function calculateTeamColor(team: DinnerRouteTeam, mealTypeMappings: Record<string, MealType>, colorOverride?: string): string {
  if (isStringNotEmpty(colorOverride)) {
    return colorOverride;
  }
  // const mealType = mealTypeMappings[team.meal.id!];
  // return mapMealTypeToColor(mealType);
  return stringToColor(`${getFullname(team.hostTeamMember)}${team.teamNumber}`);
}

function calculatAfterPartyLocationColor(): string {
  return AFTER_PARTY_LOCATION_COLOR;
  // if (isSingleDinnerRouteView) {
  //   return colorOverride;
  // }
  // return stringToColor(`${afterPartyLocation.cityName}${afterPartyLocation.street}`);
}

function isGuestTeam(team: DinnerRouteTeam, currentTeam: DinnerRouteTeam): boolean {
  return currentTeam.teamNumber !== team.teamNumber;
}

function calculateDinnerRouteMapEntry(dinnerRoute: DinnerRoute, 
                                      dinnerRouteTeamsWithGeocode: DinnerRouteTeam[], 
                                      afterPartyLocationMapEntry: AfterPartyLocationMapEntry | undefined,
                                      mealTypeMappings: Record<string, MealType>,
                                      isSingleDinnerRouteView: boolean): DinnerRouteTeamMapEntry[] {

  const dinnerRouteTeams = getDinnerRouteTeamsWithGeocode(dinnerRoute, dinnerRouteTeamsWithGeocode);
  const currentTeam = findDinnerRouteTeamByNumber(dinnerRoute.currentTeam.teamNumber, dinnerRouteTeams);
  if (!currentTeam) {
    return [];
  }

  const result = new Array<DinnerRouteTeamMapEntry>();

  const currentTeamColor = calculateTeamColor(currentTeam, mealTypeMappings, isSingleDinnerRouteView ? CURRENT_TEAM_COLOR_SINGLE_ROUTE_VIEW : undefined);

  const teamConnectionPaths = new Array<TeamConnectionPath>();

  for (let i = 0; i < dinnerRouteTeams.length; i++) {
    const team = dinnerRouteTeams[i];

    if (isSingleDinnerRouteView && isGuestTeam(team, currentTeam)) {
      // Case: Show complete dinner-route for only one team (we need also the positions of the other host teams in the result)
      result.push(
        newDinnerRouteMapEntry(team, calculateTeamColor(team, mealTypeMappings, GUEST_TEAM_COLOR_SINGLE_ROUTE_VIEW), team.geocodingResult!, [], mealTypeMappings)
      );
    }

    // let coordinates: GeocodingResult[] = [];
    if (i + 1 < dinnerRouteTeams.length) {
      teamConnectionPaths.push(newTeamConnectionPath(team, currentTeamColor, dinnerRouteTeams[i + 1]));
    } else if (afterPartyLocationMapEntry) {
      teamConnectionPaths.push({
        coordinates: [team.geocodingResult!, afterPartyLocationMapEntry.position],
        color: currentTeamColor,
        key: `${currentTeam.teamNumber}-afterparty`,
        team,
      })
    }
  }

  result.push(
    newDinnerRouteMapEntry(currentTeam, currentTeamColor, currentTeam.geocodingResult!, teamConnectionPaths, mealTypeMappings)
  );

  return result;
}


function newTeamConnectionPath(team: DinnerRouteTeam, 
                               color: string,
                               nextTeam: DinnerRouteTeam): TeamConnectionPath {

  const coordinates: GeocodingResult[] = [team.geocodingResult!, nextTeam.geocodingResult!];
  const key = `${team.teamNumber}-${nextTeam.teamNumber}`;

  return {
    coordinates,
    color,
    key,
    team,
    toTeam: nextTeam
  };
}

function newDinnerRouteMapEntry(team: DinnerRouteTeam, 
                                color: string, 
                                position: GeocodingResult,
                                teamConnectionPaths: TeamConnectionPath[],
                                mealTypeMappings: Record<string, MealType>): DinnerRouteTeamMapEntry {
  return {
    ...team,
    color,
    position,
    teamConnectionPaths,
    mealType: mealTypeMappings[team.meal.id!]
  };
}


function getDinnerRouteTeamsWithGeocode(dinnerRoute: DinnerRoute, dinnerRouteTeamsWithGeocode: DinnerRouteTeam[]): DinnerRouteTeam[] {
  const result = dinnerRoute.teams.map(t => findDinnerRouteTeamByNumber(t.teamNumber, dinnerRouteTeamsWithGeocode))
                                  .filter(t => isDefined(t));
  // @ts-ignore                                
  return result || [];
}

export function calculateDinnerRouteMapData(settings: DinnerRouteMapDataCalculationSettings): DinnerRouteMapData {

  const {allDinnerRoutes, afterPartyLocation, meals } = settings;

  let dinnerRouteTeamsWithGeocodes = settings.dinnerRouteTeamsWithGeocodes || [];
  dinnerRouteTeamsWithGeocodes = dinnerRouteTeamsWithGeocodes.filter(team => isGeocodingResultValid(team.geocodingResult));

  const dinnerRouteMapEntries = new Array<DinnerRouteTeamMapEntry>();

  let centerPosition;
  let showWarnings = false;

  const isSingleDinnerRouteView = allDinnerRoutes.length === 1;
  const mealTypeMappings = buildMealTypeMappings(meals);

  let afterPartyLocationMapEntry: AfterPartyLocationMapEntry | undefined;
  if (isGeocodingResultValid(afterPartyLocation?.geocodingResult)) {
    afterPartyLocationMapEntry = {
      ...afterPartyLocation,
      position: afterPartyLocation.geocodingResult!,
      color: calculatAfterPartyLocationColor()
    };
  }

  for (let i = 0; i < allDinnerRoutes.length; i++) {
    const dinnerRoute = allDinnerRoutes[i];

    const entriesForRoute = calculateDinnerRouteMapEntry(dinnerRoute, dinnerRouteTeamsWithGeocodes, afterPartyLocationMapEntry, mealTypeMappings, isSingleDinnerRouteView);
    if (entriesForRoute.length === 0) {
      showWarnings = true;
      continue;
    }
    entriesForRoute.forEach(entry => dinnerRouteMapEntries.push(entry));

    if (!centerPosition) { // Position of current team
      centerPosition = entriesForRoute[entriesForRoute.length -1].position;
    }
  }

  addOffsetToMapEntriesWithSameAddress(dinnerRouteMapEntries, settings.teamClustersWithSameAddress);

  return {
    dinnerRouteMapEntries,
    afterPartyLocationMapEntry,
    centerPosition: centerPosition || { lat: 0, lng: 0 },
    showWarnings
  };
}

function addOffsetToMapEntriesWithSameAddress(dinnerRouteMapEntries: DinnerRouteTeamMapEntry[], teamClustersWithSameAddress: TeamDistanceCluster[]) {
  teamClustersWithSameAddress.forEach(cluster => {
    const clusterEntries = dinnerRouteMapEntries.filter(entry => cluster.teams.some(team => team.teamNumber === entry.teamNumber));
    if (clusterEntries.length === 0) {
      return;
    }
    let offset = 0;
    clusterEntries.forEach(entry => {
      entry.position!.lat! += offset;
      entry.position!.lng! += offset;
      offset += 0.0002;
    });
  });
}

export function findDinnerRouteMapEntryForCurrentDinnerRouteTeam(dinnerRouteMapData: DinnerRouteMapData, dinnerRoute: DinnerRoute) {
  return dinnerRouteMapData.dinnerRouteMapEntries.find(entry => entry.teamNumber === dinnerRoute.currentTeam.teamNumber);
}

function findDinnerRouteTeamByNumber(teamNumber: number, incomingDinnerRouteTeamsWithGeocodes: DinnerRouteTeam[]) {
  return incomingDinnerRouteTeamsWithGeocodes.find(team => team.teamNumber === teamNumber);
}

export function distinctDinnerRouteTeams(allDinnerRouteTeams: DinnerRouteTeam[]): DinnerRouteTeam[] {
  return allDinnerRouteTeams.filter((team, index, self) => index === self.findIndex(t => t.teamNumber === team.teamNumber));
}

export function getMarkerLabel(str: string) {
  return str.substring(0, Math.min(3, str.length));
}

export function buildMealTypeMappings(meals: Meal[]): Record<string, MealType> {
  const result: Record<string, MealType> = {};
  for (let i = 0; i < meals.length; i++) {
    if (i == 0) {
      result[meals[i].id!] = MealType.APPETIZER;
    } else if (i == 2) {
      result[meals[i].id!] = MealType.DESSERT;
    } else { 
      result[meals[i].id!] = MealType.MAIN_COURSE;
    }
  }
  return result;
}

export function mapMealTypeToColor(mealType: MealType | undefined): string {
  if (!mealType) {
    // return "#7ebb89";
    return "#000";
  }
  switch (mealType) {
    case MealType.APPETIZER:
      return "#f74324";
    case MealType.MAIN_COURSE:
      return "#000";
    case MealType.DESSERT:
      return "#a18ed2";
  }
}

export function getHostTeamsOfDinnerRouteMapEntry(dinnerRouteMapEntry: DinnerRouteTeamMapEntry): DinnerRouteTeam[] {
  
  const result = new Array<DinnerRouteTeam>();
  const teamConnectionPaths = dinnerRouteMapEntry.teamConnectionPaths.filter(tcp => tcp.team);

  for (let i = 0; i < teamConnectionPaths.length; i++) {
    const teamConnectionPath = teamConnectionPaths[i];
    if (teamConnectionPath.team.teamNumber !== dinnerRouteMapEntry.teamNumber) {
      result.push(teamConnectionPath.team);
    }
    if (teamConnectionPath.toTeam && teamConnectionPath.toTeam.teamNumber !== dinnerRouteMapEntry.teamNumber) {
      result.push(teamConnectionPath.toTeam);
    }
  }
  return uniqBy(result, "teamNumber");
}