export interface SelfAdminSessionData {
  selfAdministrationId: string;
  languageCode: string;
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

export  interface SelfAdminChangeTeamHostViewModel {
  comment: string;
}
