import {Meal} from "./RunningDinner";
import {Participant, TeamPartnerOption} from "./Participant";
import {BaseEntity} from "./Base";
import {isArrayEmpty, isStringNotEmpty} from "../Utils";
import {isTeamPartnerWishRegistration} from "../admin";

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

export function getTeamPartnerOptionOfTeam(team: Team): TeamPartnerOption {
  if (!team) {
    return TeamPartnerOption.NONE;
  }

  for (let i = 0; i < team.teamMembers.length; i++) {
    const teamMember = team.teamMembers[i];
    if (isTeamPartnerWishRegistration(teamMember)) {
      return TeamPartnerOption.REGISTRATION;
    } else if (isStringNotEmpty(teamMember.teamPartnerWishEmail)) {
      return TeamPartnerOption.INVITATION;
    }
  }
  return TeamPartnerOption.NONE;
}

export function hasAllTeamMembersSameTeamPartnerWish(team: Team, optionToCheck: TeamPartnerOption): boolean {
  if (optionToCheck === TeamPartnerOption.NONE || isArrayEmpty(team.teamMembers) || team.teamMembers.length  <= 1) {
    return false;
  }
  const valuesToCheck = team.teamMembers.map(p => {
    if (optionToCheck === TeamPartnerOption.INVITATION) {
      let invitationArr = [p.teamPartnerWishEmail || "", p.email || ""];
      invitationArr = invitationArr.map(email => email.toLowerCase().trim());
      invitationArr.sort();
      return invitationArr.join("-");
    } else if (optionToCheck === TeamPartnerOption.REGISTRATION) {
      return p.teamPartnerWishOriginatorId || "";
    }
    return "";
  });
  const allSame = valuesToCheck.every(val => val === valuesToCheck[0] && isStringNotEmpty(val));
  return allSame;
}