import { AfterPartyLocation, DinnerRoute, DinnerRouteTeam, GeocodingResult, getFullname, isDefined, isGeocodingResultValid, isStringNotEmpty, stringToColor } from "@runningdinner/shared";

export type MapEntry = {
  color: string;
  position: GeocodingResult
};

export type TeamConnectionPath = {
  path: GeocodingResult;
  color: string;
  key: string;
}

export type DinnerRouteTeamMapEntry = {
  teamConnectionPaths: TeamConnectionPath[];
} & DinnerRouteTeam & MapEntry;


export type AfterPartyLocationMapEntry = {
} & AfterPartyLocation & MapEntry;

export type DinnerRouteMapData = {
  dinnerRouteMapEntries: DinnerRouteTeamMapEntry[];
  showWarnings?: boolean;
  centerPosition: GeocodingResult;
  afterPartyLocationMapEntry?: AfterPartyLocationMapEntry
};

export type DinnerRouteMapDataCalculationSettings = {
  /**
   * If true, the markers for the other host teams are added to the map as well (only reasonable for single dinner route map view)
   */
  addMarkersForOtherHostTeams?: boolean;

  /**
   * If set, the color of the current team is overridden with this color (and not dynamically calculated) => reasonable for single dinner route map view
   */
  currentTeamColorOverride?: string;

  /**
   * If set, the color of the host team is overridden with this color (and not dynamically calculated) => reasonable for single dinner route map view
   */
  otherHostTeamColorOverride?: string;

  /**
   * If set, the color of the after party location is overridden with this color (and not dynamically calculated) => reasonable for all types of view
   */
  afterPartyLocationColorOverride?: string;
}


function calculateTeamColor(team: DinnerRouteTeam, colorOverride?: string): string {
  if (isStringNotEmpty(colorOverride)) {
    return colorOverride;
  }
  return stringToColor(`${getFullname(team.hostTeamMember)}${team.teamNumber}${team.meal.label}`);
}

function calculatAfterPartyLocationColor(afterPartyLocation: AfterPartyLocation, colorOverride?: string): string {
  if (isStringNotEmpty(colorOverride)) {
    return colorOverride;
  }
  return stringToColor(`${afterPartyLocation.cityName}${afterPartyLocation.street}`);
}


function calculateDinnerRouteMapEntry(dinnerRoute: DinnerRoute, 
                                      dinnerRouteTeamsWithGeocode: DinnerRouteTeam[], 
                                      afterPartyLocationMapEntry: AfterPartyLocationMapEntry | undefined,
                                      settings: DinnerRouteMapDataCalculationSettings): DinnerRouteTeamMapEntry[] {

  const dinnerRouteTeams = getDinnerRouteTeamsWithGeocode(dinnerRoute, dinnerRouteTeamsWithGeocode);
  const currentTeam = findDinnerRouteTeamByNumber(dinnerRoute.currentTeam.teamNumber, dinnerRouteTeams);
  if (!currentTeam) {
    return [];
  }

  const result = new Array<DinnerRouteTeamMapEntry>();

  const color = calculateTeamColor(currentTeam, settings.currentTeamColorOverride);

  const teamConnectionPaths = new Array<TeamConnectionPath>();
  dinnerRouteTeams.forEach(team => {
    if (settings.addMarkersForOtherHostTeams && team.teamNumber !== currentTeam.teamNumber) {
      // Case: Show complete dinner-route for only one team (we need also the positiions of the other host teams in the result)
      result.push({
        ...team,
        color: calculateTeamColor(team, settings.otherHostTeamColorOverride),
        position: team.geocodingResult!,
        teamConnectionPaths: []
      })
    } 
    teamConnectionPaths.push({
      path: team.geocodingResult!,
      color,
      key: `${currentTeam.teamNumber}-${team.teamNumber}`
    });
  });

  if (afterPartyLocationMapEntry) {
    teamConnectionPaths.push({
      path: afterPartyLocationMapEntry.position,
      color,
      key: `${currentTeam.teamNumber}-afterparty`
    });
  }

  result.push({
    ...currentTeam,
    color,
    position: currentTeam.geocodingResult!,
    teamConnectionPaths
  });

  return result;
}

function getDinnerRouteTeamsWithGeocode(dinnerRoute: DinnerRoute, dinnerRouteTeamsWithGeocode: DinnerRouteTeam[]): DinnerRouteTeam[] {
  const result = dinnerRoute.teams.map(t => findDinnerRouteTeamByNumber(t.teamNumber, dinnerRouteTeamsWithGeocode))
                                  .filter(t => isDefined(t));
  // @ts-ignore                                
  return result || [];
}

export function calculateDinnerRouteMapData(allDinnerRoutes: DinnerRoute[], 
                                            incomingDinnerRouteTeamsWithGeocodes: DinnerRouteTeam[] | undefined, 
                                            afterPartyLocation: AfterPartyLocation | null,
                                            settings: DinnerRouteMapDataCalculationSettings): DinnerRouteMapData {

  let dinnerRouteTeamsWithGeocodes = incomingDinnerRouteTeamsWithGeocodes || [];
  dinnerRouteTeamsWithGeocodes = dinnerRouteTeamsWithGeocodes.filter(team => isGeocodingResultValid(team.geocodingResult));

  const dinnerRouteMapEntries = new Array<DinnerRouteTeamMapEntry>();

  let centerPosition;
  let showWarnings = false;

  let afterPartyLocationMapEntry: AfterPartyLocationMapEntry | undefined;
  if (isGeocodingResultValid(afterPartyLocation?.geocodingResult)) {
    afterPartyLocationMapEntry = {
      ...afterPartyLocation,
      position: afterPartyLocation.geocodingResult!,
      color: calculatAfterPartyLocationColor(afterPartyLocation, settings.afterPartyLocationColorOverride)
    };
  }

  for (let i = 0; i < allDinnerRoutes.length; i++) {
    const dinnerRoute = allDinnerRoutes[i];

    const entriesForRoute = calculateDinnerRouteMapEntry(dinnerRoute, dinnerRouteTeamsWithGeocodes, afterPartyLocationMapEntry, settings);
    if (entriesForRoute.length === 0) {
      showWarnings = true;
      continue;
    }
    entriesForRoute.forEach(entry => dinnerRouteMapEntries.push(entry));

    if (!centerPosition) { // Position of current team
      centerPosition = entriesForRoute[entriesForRoute.length -1].position;
    }
  }

  return {
    dinnerRouteMapEntries,
    afterPartyLocationMapEntry,
    centerPosition: centerPosition || { lat: 0, lng: 0 },
    showWarnings
  };
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