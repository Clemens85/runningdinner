(function(angular) {
  'use strict';

  angular.module('rd.admin.services').factory('ActivityService', ActivityService);

  function ActivityService(RestClientService, MessageService, AdminRequests, Constants, _) {

    var messageActivities = [
        Constants.ACTIVITY.DINNERROUTE_MAIL_SENT,
        Constants.ACTIVITY.PARTICIPANT_MAIL_SENT,
        Constants.ACTIVITY.TEAMARRANGEMENT_MAIL_SENT
    ];

    return {
      findAdminActivitiesByAdminId: findAdminActivitiesByAdminIdImpl,
      findParticipantActivitiesByAdminId: findParticipantActivitiesByAdminIdImpl,
      findActivitiesByAdminIdAndTypeAsync: findActivitiesByAdminIdAndTypeAsyncImpl,
      processAdminActivities: processAdminActivitiesImpl,
      isMessageActivityContained: isMessageActivityContainedImpl,
      filterActivitiesByType: filterActivitiesByTypeImpl
    };

    function findAdminActivitiesByAdminIdImpl(adminId) {
      return RestClientService.execute(AdminRequests.findAdminActivitiesByAdminId, {
        "pathParams": {
          "adminId": adminId
        }
      });
    }

    function findParticipantActivitiesByAdminIdImpl(adminId, page) {
      return RestClientService.execute(AdminRequests.findParticipantActivitiesByAdminId, {
        "pathParams": {
          "adminId": adminId
        },
        "queryParams": {
          "page": page
        }
      });
    }

    function filterActivitiesByTypeImpl(activities, activityTypeToFilterFor) {
      return _.filter(activities, ["activityType", activityTypeToFilterFor]);
    }

    function findActivitiesByAdminIdAndTypeAsyncImpl(adminId, activityTypes) {

      var request = angular.copy(AdminRequests.findActivitiesByAdminIdAndTypes);
      request.url += "?";
      var cnt = 0;
      for (var i = 0; i < activityTypes.length; i++) {
        if (cnt++ > 0) {
          request.url += "&";
        }
        request.url += "type="+activityTypes[i];
      }
      return RestClientService.execute(request, {
        "pathParams": {
          "adminId": adminId
        }
      });
    }

    function processAdminActivitiesImpl(activities) {

      var result = [];

      angular.forEach(activities, function(activity) {

        activity.iconClass = '';
        activity.colorClass = '';

        if (activity.activityType === Constants.ACTIVITY.CUSTOM_ADMIN_CHANGE) {
          result.push(_processCustomAdminChange(activity));
        } else if (activity.activityType === Constants.ACTIVITY.DINNER_CREATED) {
          result.push(_processDinnerCreatedActivity(activity));
        } else if (activity.activityType === Constants.ACTIVITY.DINNER_CANCELLED) {
          result.push(_processDinnerCancelledActivity(activity));
        } else if (messageActivities.indexOf(activity.activityType) > -1) {
          result.push(_processMessageActivity(activity));
        } else if (activity.activityType === Constants.ACTIVITY.MESSAGE_JOB_SENDING_FAILED) {
          result.push(_processMessageJobSendingFailedActivity(activity));
        } else if (activity.activityType === Constants.ACTIVITY.TEAM_ARRANGEMENT_CREATED) {
          result.push(_processTeamArrangementCreatedActivity(activity));
        } else if (activity.activityType === Constants.ACTIVITY.TEAMS_RECREATED) {
          result.push(_processTeamsReCreatedActivity(activity));
        } else if (activity.activityType === Constants.ACTIVITY.MEAL_TIMES_UPDATED) {
          result.push(_processMealTimesUpdatedActivity(activity));
        } else {
          result.push(activity);
        }
      });

      return result;
    }

    function _processCustomAdminChange(activity) {
      activity.colorClass = 'warning';
      activity.iconClass = 'fa-edit';
      return activity;
    }

    function _processTeamArrangementCreatedActivity(activity) {
      activity.colorClass = 'success';
      activity.iconClass = 'fa-users';
      return activity;
    }

    function _processTeamsReCreatedActivity(activity) {
      activity.colorClass = 'warning';
      activity.iconClass = 'fa-users';
      return activity;
    }

    function _processMealTimesUpdatedActivity(activity) {
      activity.colorClass = 'warning';
      activity.iconClass = 'fa-clock-o';
      return activity;
    }

    function _processDinnerCreatedActivity(activity) {
      activity.colorClass = 'success';
      activity.iconClass = 'fa-floppy-o';
      return activity;
    }

    function _processDinnerCancelledActivity(activity) {
      activity.colorClass = "danger";
      activity.iconClass = "fa-ban";
      return activity;
    }

    function _processMessageActivity(activity) {
      activity.colorClass = 'primary';
      activity.iconClass = 'fa-envelope-o';

      MessageService
        .findMessageJobOverviewAsync(activity.adminId, activity.relatedEntityId)
        .then(function(response) {
          _addMessageJobDetailsToActivityMessage(activity, response);
          if (response.sendingFinished === true) {
            activity.activityMessage += "<i>Sendevorgang abgeschlossen</i>";
            activity.helpIconMessage = "synchronize_messagejobs_help";
          } else {
            activity.activityMessage += "<i>Sendevorgang läuft noch</i>";
          }
        });
      return activity;
    }

    function _processMessageJobSendingFailedActivity(activity) {
      activity.colorClass = 'danger';
      activity.iconClass = 'fa-envelope-o';

      MessageService
          .findMessageJobOverviewAsync(activity.adminId, activity.relatedEntityId)
          .then(function(response) {
            _addMessageJobDetailsToActivityMessage(activity, response);
          });
      return activity;
    }

    function _addMessageJobDetailsToActivityMessage(activity, response) {
      var messageJobUrl = MessageService.getMessageJobUrl(response.adminId, response.messageJobId);
      activity.activityMessage += "<br>";
      activity.activityMessage += "<a class='text-success' href='" + messageJobUrl + "'>" + response.numMessagesSucceeded + " erfolgreich</a><br>";
      activity.activityMessage += "<a class='text-danger' href='" + messageJobUrl + "'>" + response.numMessagesFailed + " fehlgeschlagen</a><br>";
      return activity;
    }

    function isMessageActivityContainedImpl(activities) {
      for (var i=0; i<activities.length; i++) {
        if (messageActivities.indexOf(activities[i].activityType) > -1) {
          return true;
        }
      }
      return false;
    }

  }

}(angular));
