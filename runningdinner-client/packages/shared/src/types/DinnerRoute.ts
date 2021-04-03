import { Meal } from "./RunningDinner";
import {Team, TeamStatus} from "./Team";
import {Participant} from "@runningdinner/shared";

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
}

export interface DinnerRouteTeamHost extends Omit<Participant, "id"> {

}
