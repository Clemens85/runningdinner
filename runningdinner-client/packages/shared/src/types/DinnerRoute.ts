import { Meal } from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {GeocodingResult, Participant} from "@runningdinner/shared";

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
}

export interface DinnerRouteTeamHost extends Omit<Participant, "id"> {

}

export function isSameDinnerRouteTeam(a: DinnerRouteTeam, b: DinnerRouteTeam) {
 return a.teamNumber === b.teamNumber;
}
