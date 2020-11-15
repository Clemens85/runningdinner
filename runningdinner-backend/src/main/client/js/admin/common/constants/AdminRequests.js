(function(angular) {
  'use strict';

  angular.module('rd.admin.constants').constant('AdminRequests', {

   "findRunningDinnerByAdminId": {
      "method": 'GET',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId',
      "cache": false
    },

    "cancelRunningDinner": {
      "method": 'DELETE',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId'
    },

    "acknowledgeRunningDinner": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/acknowledge/:acknowledgeId'
    },

    "findParticipantsByDinnerAdminId": {
      "method": 'GET',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participants'
    },

    "findNotActivatedParticipantsByIdsAndAdminId": {
      "method": 'PUT',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participants/not-active'
    },

    "updateParticipantSubscriptionByIdAndAdminId": {
      "method": 'PUT',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participant/:participantId/activate'
    },

    "deleteParticipant": {
      "method": 'DELETE',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participant/:participantId'
    },

    "findTeamPartnerWishInfo": {
      "method": 'GET',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participant/:participantId/team-partner-wish'
    },

    "findTeamsByAdminId": {
      "method": 'GET',
      "url": '/rest/teamservice/v1/runningdinner/:adminId'
    },

    "findTeamMeetingPlanByAdminIdAndTeamId": {
      "method": 'GET',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/team/:teamId/meetingplan'
    },

    "findDinnerRouteByAdminIdAndTeamId": {
      "method": 'GET',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/team/:teamId/dinnerroute'
    },

    "createTeamArrangements": {
      "method": 'POST',
      "url": '/rest/teamservice/v1/runningdinner/:adminId'
    },

    "reCreateTeamArrangements": {
      "method": 'PUT',
      "url": '/rest/teamservice/v1/runningdinner/:adminId'
    },

    "updateTeamHosts": {
      "method": 'PUT',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/teamhosts'
    },

    "swapTeamMembers": {
      "method": 'PUT',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/teammembers/swap/:firstParticipantId/:secondParticipantId'
    },

    "cancelTeam": {
      "method": 'PUT',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/team/:teamId/cancel'
    },

    "cancelTeamMember": {
      "method": 'PUT',
      "url": '/rest/teamservice/v1/runningdinner/:adminId/team/:teamId/:participantId/cancel'
    },

    "createParticipant": {
      "method": 'POST',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participant'
    },

    "updateParticipant": {
      "method": 'PUT',
      "url": '/rest/participantservice/v1/runningdinner/:adminId/participant/:participantId'
    },

    "findCustomMailServerSettingsByDinnerAdminId": {
      "method": 'GET',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mailserversettings'
    },

    "saveCustomMailServerSettings": {
      "method": 'POST',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mailserversettings'
    },

    "checkMailConnectionByDinnerAdminId": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mailserversettings/check'
    },

    "getTeamArrangementMailPreview": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/team/preview'
    },

    "sendTeamArrangementMails": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/team'
    },

    "getDinnerRouteMailPreview": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/dinnerroute/preview'
    },

    "sendDinnerRouteMails": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/dinnerroute'
    },

    "getParticipantMailPreview": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/participant/preview'
    },

    "sendParticipantMails": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/participant'
    },

    "sendTeamPartnerWishInvitation": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/mails/teampartnerwish/:participantId'
    },

    "findAdminActivitiesByAdminId": {
      "method": 'GET',
      "url": '/rest/activityservice/v1/runningdinner/:adminId/admin'
    },

    "findActivitiesByAdminIdAndTypes": {
      "method": 'GET',
      "url": '/rest/activityservice/v1/runningdinner/:adminId'
    },

    "findParticipantActivitiesByAdminId": {
      "method": 'GET',
      "url": '/rest/activityservice/v1/runningdinner/:adminId/participant'
    },

    "updateMealTimes": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/mealtimes'
    },

    "updateBasicSettings": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/basicsettings'
    },

    "updatePublicSettings": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/publicsettings'
    },

    "updateRegistrationActiveState": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/publicsettings/registration/:enable'
    },

    "updateTeamPartnerWishDisabled": {
      "method": 'PUT',
      "url": '/rest/runningdinnerservice/v1/runningdinner/:adminId/options/team-partner-wish-disabled/:teamPartnerWishDisabled'
    },

    "findMessageJobsByAdminIdAndType": {
      "method": 'GET',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagejobs'
    },

    "findMessageTasksByAdminIdAndMessageJobId": {
      "method": 'GET',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagetasks/:messageJobId'
    },

    "findMessageJobByAdminIdAndMessageJobId": {
      "method": 'GET',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagejobs/:messageJobId'
    },

    "findMessageJobOverviewByAdminIdAndMessageJobId": {
      "method": 'GET',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagejobs/:messageJobId/overview'
    },

    "reSendMessageTask": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagetask/:messageTaskId'
    },

    "synchronizeMessageJob": {
      "method": 'PUT',
      "url": '/rest/messageservice/v1/runningdinner/:adminId/messagejobs/:messageJobId/synchronize'
    }

  });
}(angular));
