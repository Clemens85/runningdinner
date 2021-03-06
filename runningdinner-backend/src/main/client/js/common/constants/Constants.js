(function(angular) {
  'use strict';

  angular.module('rd.common.constants').constant('Constants', {

    "ERROR": {
      "FIELDLESS_VALIDATION_ERROR": "FIELDLESS_VALIDATION_ERROR"
    },

    "ISSUE_TYPE": {
      "VALIDATION": "VALIDATION",
      "TECHNICAL": "TECHNICAL",
      "BAD_REQUEST": "BAD_REQUEST"
    },

    "NOTIFICATION": {
      "SUCCESS": "NOTIFICATION_SUCCESS",
      "VALIDATION_ERROR": "NOTIFICATION_VALIDATION_ERROR",
      "GLOBAL_ERROR": "NOTIFICATION_GLOBAL_ERROR"
    },

    "GENDER": {
      "MALE": "MALE",
      "FEMALE": "FEMALE",
      "UNDEFINED": "UNDEFINED"
    },

    "REGISTRATION_TYPE": {
      "OPEN": "OPEN",
      "CLOSED": "CLOSED",
      "PUBLIC": "PUBLIC"
    },

    // Actually this is admin stuff and should be placed in own module!
    "MAIL_SERVER_TYPE": {
      "STANDARD": "standard",
      "CUSTOM": "custom"
    },

    "ACTIVITY": {
      "DINNER_CREATED": "DINNER_CREATED",
      "PARTICIPANTS_UPLOADED": "PARTICIPANTS_UPLOADED",

      "PARTICIPANT_SUBSCRIBED": "PARTICIPANT_SUBSCRIBED",
      "PARTICIPANT_UNSUBSCRIBED": "PARTICIPANT_UNSUBSCRIBED",
      "PARTICIPANT_CHANGED_TEAMHOST": "PARTICIPANT_CHANGED_TEAMHOST",

      "PARTICIPANT_MAIL_SENT": "PARTICIPANT_MAIL_SENT",
      "TEAMARRANGEMENT_MAIL_SENT": "TEAMARRANGEMENT_MAIL_SENT",
      "DINNERROUTE_MAIL_SENT": "DINNERROUTE_MAIL_SENT",

      "MESSAGE_JOB_SENDING_FAILED": "MESSAGE_JOB_SENDING_FAILED",

      "TEAM_ARRANGEMENT_CREATED": "TEAM_ARRANGEMENT_CREATED",
      "TEAMS_RECREATED": "TEAMS_RECREATED",
      "MEAL_TIMES_UPDATED": "MEAL_TIMES_UPDATED",

      "CUSTOM_ADMIN_CHANGE": "CUSTOM_ADMIN_CHANGE",
      "TEAM_MEMBERS_SWAPPED": "TEAM_MEMBERS_SWAPPED",
      "TEAMS_HOST_CHANGED": "TEAMS_HOST_CHANGED",
      "TEAM_CANCELLED_ACTIVITY": "TEAM_CANCELLED",
      "DINNER_CANCELLED": "DINNER_CANCELLED"
    },

    "ASSIGNMENT_TYPE": {
      'NOT_ASSIGNABLE': 'NOT_ASSIGNABLE',
      'ASSIGNED_TO_TEAM': 'ASSIGNED_TO_TEAM',
      'ASSIGNABLE': 'ASSIGNABLE'
    },

    "TEAM_STATUS": {
      "OK": "OK",
      "REPLACED": "REPLACED",
      "CANCELLED": "CANCELLED"
    },

    "MESSAGE_TYPE": {
      "PARTICIPANT": "PARTICIPANT",
      "TEAM": "TEAM",
      "DINNER_ROUTE": "DINNER_ROUTE"
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

    "RUNNING_DINNER_TYPE": {
      "STANDARD": "STANDARD",
      "DEMO": "DEMO"
    },

    "TEAM_PARTNER_WISH_STATE": {
      "NOT_EXISTING": "NOT_EXISTING",
      "EXISTS_EMPTY_TEAM_PARTNER_WISH": "EXISTS_EMPTY_TEAM_PARTNER_WISH"
    },

    "UNDEFINED_NUMBER": -1,

    "GLOBAL_ADMIN_EMAIL": 'runyourdinner@gmail.com',

    "IMPRESSUM_LINK": '/impressum'

  });

})(angular);
