export const CONSTANTS = {

  "REGISTRATION_TYPE": {
    "OPEN": "OPEN",
    "CLOSED": "CLOSED",
    "PUBLIC": "PUBLIC"
  },

  "GENDER": {
    "MALE": "MALE",
    "FEMALE": "FEMALE",
    "UNDEFINED": "UNDEFINED"
  },

  "ASSIGNMENT_TYPE": {
    'NOT_ASSIGNABLE': 'NOT_ASSIGNABLE',
    'ASSIGNED_TO_TEAM': 'ASSIGNED_TO_TEAM',
    'ASSIGNABLE': 'ASSIGNABLE'
  },

  "PARTICIPANT_SELECTION": {
    "ALL": "ALL",
    "ASSIGNED_TO_TEAM": "ASSIGNED_TO_TEAM",
    "NOT_ASSIGNED_TO_TEAM": "NOT_ASSIGNED_TO_TEAM",
    "CUSTOM_SELECTION": "CUSTOM_SELECTION"
  },

  "TEAM_SELECTION": {
    "ALL": "ALL",
    "CUSTOM_SELECTION": "CUSTOM_SELECTION"
  },

  "TEAM_PARTNER_WISH_STATE": {
    "NOT_EXISTING": "NOT_EXISTING",
    "EXISTS_EMPTY_TEAM_PARTNER_WISH": "EXISTS_EMPTY_TEAM_PARTNER_WISH"
  },

  "TEAM_STATUS": {
    "REPLACED": "REPLACED",
    "CANCELLED": "CANCELLED",
  },


  "SENDING_STATUS": {
    "QUEUED": "QUEUED",
    "SENDING_STARTED": "SENDING_STARTED",
    "SENDING_FINISHED": "SENDING_FINISHED"
  },

  // Own constants just for client to aggregate sending-status and result:
  "SENDING_STATUS_RESULT": {
    "SENDING_FINISHED_SUCCESS": "SENDING_FINISHED_SUCCESS",
    "SENDING_FINISHED_FAILURE": "SENDING_FINISHED_FAILURE",
    "SENDING_NOT_FINISHED": 'SENDING_NOT_FINISHED'
  },

  "VALIDATION_ISSUE_CONSTANTS": {
    "TEAM_NO_TEAM_MEMBERS_LEFT": "team_no_team_members_left",
    "PARTICIPANT_ASSINGED_IN_TEAM": "participant_assigned_in_team"
  }
};


