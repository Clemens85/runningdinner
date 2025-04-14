import { uniqBy } from "lodash-es";
import { isGeocodingResultValid } from "../../GeocoderHook";
import { AfterPartyLocation, AfterPartyLocationMapEntry, DinnerRoute, DinnerRouteMapData, DinnerRouteTeam, DinnerRouteTeamMapEntry, GeocodingResult, Meal, MealType, Team, TeamConnectionPath, TeamDistanceCluster } from "../../types";
import { isDefined, isStringNotEmpty, stringToColor } from "../../Utils";
import { getFullname } from "../ParticipantService";
import { TeamDistanceClusterEnhancer } from "./TeamDistanceClusterEnhancer";

const clusterBackgroundColorsHighContrast: string[] = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008080',
  '#FFC0CB',
  '#A52A2A',
  '#000080',
  '#FF6347',
  '#4682B4',
  '#FFD700',
  '#ADFF2F',
  '#D2691E',
  '#FF1493',
  '#00BFFF',
  '#FF8C00',
  '#8A2BE2',
  '#FF69B4',
  '#7FFF00',
  '#FF4500',
];

export type DinnerRouteMapDataCalculationSettings = {
  /**
   * The dinner routes for which to claculate the map data
   */
  allDinnerRoutes: DinnerRoute[], 

  /**
   * Provides team segment clusters (teams that form one sub-dinner,  e.g. with 9 or 12 teams)
   */
  teamClusterMappings?: Record<number, number[]>;

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

export class DinnerRouteMapCalculator {

  private readonly settings: DinnerRouteMapDataCalculationSettings

  private readonly dinnerRouteTeamsWithGeocodes: DinnerRouteTeam[];

  private readonly isSingleDinnerRouteView: boolean;

  private readonly mealTypeMappings: Record<string, MealType>;

  private readonly afterPartyLocationMapEntry: AfterPartyLocationMapEntry | undefined;

  private readonly secondaryClusterColorMappings: Record<number, string> = {}; 

  constructor(settings: DinnerRouteMapDataCalculationSettings) {
    this.settings = settings;
    const {allDinnerRoutes, meals, afterPartyLocation, teamClusterMappings } = settings;
  
    this.dinnerRouteTeamsWithGeocodes = (settings.dinnerRouteTeamsWithGeocodes || []).filter(team => isGeocodingResultValid(team.geocodingResult));
    this.isSingleDinnerRouteView = allDinnerRoutes.length === 1;
    this.mealTypeMappings = DinnerRouteMapCalculator.buildMealTypeMappings(meals);

    this.afterPartyLocationMapEntry = isGeocodingResultValid(afterPartyLocation?.geocodingResult) ? 
        { ...afterPartyLocation,
          position: afterPartyLocation.geocodingResult!,
          color: DinnerRouteMapCalculator.calculatAfterPartyLocationColor()
        } 
        : undefined;

    // Build color mappings for team clusters
    let clusterColorIndex = 0;
    if (teamClusterMappings) {
      Object.keys(teamClusterMappings).forEach(key => {
        const teamNumbersOfCluster = teamClusterMappings[Number(key)];
        const clusterColor = clusterBackgroundColorsHighContrast[clusterColorIndex % clusterBackgroundColorsHighContrast.length];
        clusterColorIndex++;
        teamNumbersOfCluster.forEach(teamNumber => {
          this.secondaryClusterColorMappings[teamNumber] = clusterColor;
        }); 
      });
    }
  }


  public static getMarkerLabel(str: string) {
    return str.substring(0, Math.min(3, str.length));
  }

  public static getHostTeamsOfDinnerRouteMapEntry(dinnerRouteMapEntry: DinnerRouteTeamMapEntry): DinnerRouteTeam[] {
  
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

  public static distinctDinnerRouteTeams(allDinnerRouteTeams: DinnerRouteTeam[]): DinnerRouteTeam[] {
    return allDinnerRouteTeams.filter((team, index, self) => index === self.findIndex(t => t.teamNumber === team.teamNumber));
  }
  
  public static buildMealTypeMappings(meals: Meal[]): Record<string, MealType> {
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

  public calculateDinnerRouteMapData(): DinnerRouteMapData {

    const {allDinnerRoutes} = this.settings;
  
    const dinnerRouteMapEntries = new Array<DinnerRouteTeamMapEntry>();
    let centerPosition;
    const teamsWithUnresolvedGeocodings = new Array<DinnerRouteTeam>();
  
    for (let i = 0; i < allDinnerRoutes.length; i++) {
      const dinnerRoute = allDinnerRoutes[i];
  
      const entriesForRoute = this.calculateDinnerRouteMapEntry(dinnerRoute);
      if (entriesForRoute.length === 0) {
        teamsWithUnresolvedGeocodings.push(...dinnerRoute.teams.filter(team => dinnerRoute.currentTeam.teamNumber === team.teamNumber));
        continue;
      } else if (this.isSingleDinnerRouteView && dinnerRouteMapEntries.length < dinnerRoute.teams.length) {
        // Get DinnerRoute Teams that are not contained in dinnerRouteMapEntries
        const teamsWithoutDinnerRouteMapEntry = dinnerRoute.teams.filter(team => !entriesForRoute.some(entry => entry.teamNumber === team.teamNumber));
        teamsWithUnresolvedGeocodings.push(...teamsWithoutDinnerRouteMapEntry);
      }
      entriesForRoute.forEach(entry => dinnerRouteMapEntries.push(entry));
  
      if (!centerPosition) { // Position of current team
        centerPosition = entriesForRoute[entriesForRoute.length -1].position;
      }
    }
  
    this.addOffsetToMapEntriesWithSameAddress(dinnerRouteMapEntries);

    const teamClustersWithSameAddress = TeamDistanceClusterEnhancer.enhanceTeamDistanceClustersWithDinnerRouteMapEntries(this.settings.teamClustersWithSameAddress, dinnerRouteMapEntries);

    return {
      dinnerRouteMapEntries,
      afterPartyLocationMapEntry: this.afterPartyLocationMapEntry,
      centerPosition: centerPosition || { lat: 0, lng: 0 },
      teamsWithUnresolvedGeocodings,
      teamClustersWithSameAddress: teamClustersWithSameAddress    
     };
  }

  private calculateDinnerRouteMapEntry(dinnerRoute: DinnerRoute): DinnerRouteTeamMapEntry[] {

    const dinnerRouteTeams = this.getDinnerRouteTeamsWithGeocode(dinnerRoute);
    const currentTeam = this.findDinnerRouteTeamByNumber(dinnerRoute.currentTeam.teamNumber);
    if (!currentTeam) {
      return [];
    }

    const result = new Array<DinnerRouteTeamMapEntry>();

    const currentTeamColor = this.calculateTeamColor(currentTeam, this.isSingleDinnerRouteView ? CURRENT_TEAM_COLOR_SINGLE_ROUTE_VIEW : undefined);

    const teamConnectionPaths = new Array<TeamConnectionPath>();

    for (let i = 0; i < dinnerRouteTeams.length; i++) {
      const team = dinnerRouteTeams[i];

      if (this.isSingleDinnerRouteView && DinnerRouteMapCalculator.isGuestTeam(team, currentTeam)) {
        // Case: Show complete dinner-route for only one team (we need also the positions of the other host teams in the result)
        result.push(
          this.newDinnerRouteMapEntry(team, this.calculateTeamColor(team, GUEST_TEAM_COLOR_SINGLE_ROUTE_VIEW), team.geocodingResult!, [])
        );
      }

      if (i + 1 < dinnerRouteTeams.length) {
        const teamConnectionPath = DinnerRouteMapCalculator.newTeamConnectionPath(team, currentTeamColor, dinnerRouteTeams[i + 1]);
        teamConnectionPath.secondaryClusterColor = this.secondaryClusterColorMappings[currentTeam.teamNumber];
        teamConnectionPaths.push(teamConnectionPath);
      } else if (this.afterPartyLocationMapEntry) {
        teamConnectionPaths.push({
          coordinates: [team.geocodingResult!, this.afterPartyLocationMapEntry.position],
          color: DinnerRouteMapCalculator.calculatAfterPartyLocationColor(),
          key: `${currentTeam.teamNumber}-afterparty`,
          team,
        });
      }
    }

    const dinnerRouteMapEntry = this.newDinnerRouteMapEntry(currentTeam, currentTeamColor, currentTeam.geocodingResult!, teamConnectionPaths);
    dinnerRouteMapEntry.secondaryClusterColor = this.secondaryClusterColorMappings[currentTeam.teamNumber];
    result.push(dinnerRouteMapEntry);

    return result;
  }

  private addOffsetToMapEntriesWithSameAddress(dinnerRouteMapEntries: DinnerRouteTeamMapEntry[]) {
    this.settings.teamClustersWithSameAddress.forEach(cluster => {
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


  private calculateTeamColor(team: DinnerRouteTeam | Team, colorOverride?: string): string {
    if (isStringNotEmpty(colorOverride)) {
      return colorOverride;
    }
    return stringToColor(`${getFullname(team.hostTeamMember)}${team.teamNumber}`);
  }
  
  private static calculatAfterPartyLocationColor(): string {
    return AFTER_PARTY_LOCATION_COLOR;
  }
  
  private static isGuestTeam(team: DinnerRouteTeam, currentTeam: DinnerRouteTeam): boolean {
    return currentTeam.teamNumber !== team.teamNumber;
  }

  private static newTeamConnectionPath(team: DinnerRouteTeam, 
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

  private newDinnerRouteMapEntry(team: DinnerRouteTeam, 
                                color: string, 
                                position: GeocodingResult,
                                teamConnectionPaths: TeamConnectionPath[]): DinnerRouteTeamMapEntry {
    return {
      ...team,
      color,
      position,
      teamConnectionPaths,
      mealType: this.mealTypeMappings[team.meal.id!]
    };
  }

  private getDinnerRouteTeamsWithGeocode(dinnerRoute: DinnerRoute): DinnerRouteTeam[] {
    const result = dinnerRoute.teams.map(t => this.findDinnerRouteTeamByNumber(t.teamNumber))
                                    .filter(t => isDefined(t));
    // @ts-ignore                                
    return result || [];
  }
  
  private findDinnerRouteTeamByNumber(teamNumber: number) {
    return this.dinnerRouteTeamsWithGeocodes.find(team => team.teamNumber === teamNumber);
  }

}

// function mapMealTypeToColor(mealType: MealType | undefined): string {
//   if (!mealType) {
//     // return "#7ebb89";
//     return "#000";
//   }
//   switch (mealType) {
//     case MealType.APPETIZER:
//       return "#f74324";
//     case MealType.MAIN_COURSE:
//       return "#000";
//     case MealType.DESSERT:
//       return "#a18ed2";
//   }
// }
