import { Meal } from './RunningDinner';

export interface SelfAdminSessionData {
  selfAdministrationId: string;
  languageCode: string;
  meals: Meal[];
}

export interface SelfAdminBaseParams {
  selfAdminId: string;
  participantId: string;
}

export interface SelfAdminTeamParams extends SelfAdminBaseParams {
  teamId: string;
}

export interface SelfAdminUpdateTeamHostRequest {
  teamId: string;
  participantId: string;
  newHostingTeamMemberId: string;
  comment: string;
}

export interface SelfAdminChangeTeamHostViewModel {
  comment: string;
}
