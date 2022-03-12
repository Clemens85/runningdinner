import { Meal } from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {GeocodingResult, Participant} from "./Participant";

export interface DinnerRoute {
  currentTeam: Team;
  mealSpecificsOfGuestTeams: string;
  teams: DinnerRouteTeam[];
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
