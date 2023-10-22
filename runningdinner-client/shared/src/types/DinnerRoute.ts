import {AfterPartyLocation, Meal} from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {Participant} from "./Participant";
import {GeocodingResult, HasGeocoding} from "./Base";
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