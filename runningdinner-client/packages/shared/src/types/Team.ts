import {Meal} from "./RunningDinner";
import {GeocodingResult, Participant} from "./Participant";
import {BaseEntity} from "./Base";
import {DinnerRouteTeam} from "@runningdinner/shared";

export enum TeamStatus {
  OK = "OK",
  CANCELLED = "CANCELLED",
  REPLACED = "REPLACED"
}

export interface Team extends BaseEntity {
  teamNumber: number;
  status: TeamStatus;
  teamMembers: Array<Participant>;
  meal: Meal;
  hostTeamMember: Participant;
}

export interface TeamArrangementList {
  teams: Array<Team>;
}

export interface HostTeam extends Team {
  meetedTeams: Team[];
}

export interface TeamMeetingPlan {
  team: Team;
  guestTeams: Team[];
  hostTeams: HostTeam[];
}

export interface TeamCancellationResult {
  team: Team;
  removedParticipants: Participant[];
  dinnerRouteMessagesSent: boolean;
  affectedGuestTeams: Team[];
  affectedHostTeams: Team[];
}

export interface TeamMemberCancelInfo {
  cancelWholeTeam: boolean;
  remainingTeamMemberNames: string[];
}
