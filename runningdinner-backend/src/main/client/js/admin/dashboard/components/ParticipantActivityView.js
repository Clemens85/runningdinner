(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('participantActivityView', {
    bindings : {
      adminId: '<',
      activitiesPromise: '<'
    },
    controller : ParticipantActivityViewCtrl,
    templateUrl : 'admin/dashboard/components/participantactivityview.html?v=@@buildno@@'
  });

  function ParticipantActivityViewCtrl(ActivityService, ParticipantService, ConfirmationDialogService, Constants,
                                       ErrorHandler, NotificationService, $translate, _) {

    var ctrl = this;
    ctrl.openParticipantFromActivity = openParticipantFromActivityImpl;
    ctrl.activateSubscription = activateSubscriptionImpl;
    ctrl.findNextParticipantActivities = findNextParticipantActivities;
    ctrl.loading = true;

    // Overview about registrations (only for non-closed dinner):
    ctrl.participantActivities = {
      activities: [],
      hasMore: false,
      page: -1
    };

    ctrl.$onInit = function() {
      findNextParticipantActivities();
    };

    function findNextParticipantActivities() {
      return ActivityService.findParticipantActivitiesByAdminId(ctrl.adminId, ctrl.participantActivities.page + 1).then(function(response) {
        ctrl.participantActivities.page = response.page;
        ctrl.participantActivities.hasMore = response.hasMore;
        ctrl.participantActivities.activities = ctrl.participantActivities.activities.concat(response.activities);
        ctrl.loading = false;
        return response.activities;
      })
      .then(function(participantActivities) {
        if (participantActivities && participantActivities.length > 0) {
          return _findNotActivatedSubscriptions(ctrl.adminId, participantActivities);
        }
      })
      .finally(function() {
        ctrl.loading = false;
      });
    }

    function openParticipantFromActivityImpl(activity) {
      if (activity.showNotActiveInfo === true) {
        return; // Cannot open not activated participant
      }
      ParticipantService.gotoParticipantDetails(activity.adminId, activity.relatedEntityId);
    }

    function activateSubscriptionImpl(participantActivity) {

      var participantEmail = participantActivity.originator;
      var confirmationTitle = $translate.instant('confirmation_activate_subscription_title', { 'participantEmail': participantEmail });
      return ConfirmationDialogService.openConfirmationDialog(confirmationTitle, 'confirmation_activate_subscription_text')
          .then(function() {
            var participantId = participantActivity.relatedEntityId;
            var adminId = participantActivity.adminId;
            return ParticipantService.updateParticipantSubscriptionAsync(participantId, adminId).then(function() {
              participantActivity.showNotActiveInfo = false;
              NotificationService.success(participantEmail + ' erfolgreich manuell bestätigt');
            });
          })
          .catch(function(errorResponse) {
            if (ErrorHandler.isValidationErrorResponse(errorResponse)) {
              var errorMessage = ErrorHandler.getSingleTranslatedIssueMessageFromResponse(errorResponse);
              NotificationService.error(errorMessage, Constants.NOTIFICATION.VALIDATION_ERROR);
            }
          });
    }

    function _findNotActivatedSubscriptions(adminId, participantActivities) {
      var participantIds = _.map(participantActivities, 'relatedEntityId');
      return ParticipantService.findNotActivatedParticipantsAsync(participantIds, adminId).then(function(notActivatedParticipants) {
        _enhanceParticipantActivities(participantActivities, notActivatedParticipants);
      });
    }

    function _enhanceParticipantActivities(participantActivities, notActivatedParticipants) {
      for (var i = 0; i < notActivatedParticipants.length; i++) {
        var foundParticipantActivity = _.find(participantActivities, ['relatedEntityId', notActivatedParticipants[i].id]);
        foundParticipantActivity.showNotActiveInfo = true;
      }
    }

  }

})(angular);
