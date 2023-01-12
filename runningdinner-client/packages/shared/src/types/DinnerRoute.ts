import {AfterPartyLocation, Meal} from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {Participant} from "./Participant";
import {GeocodingResult} from "./Base";

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
