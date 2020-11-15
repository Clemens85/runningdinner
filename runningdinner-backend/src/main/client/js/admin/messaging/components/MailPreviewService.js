(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('MailPreviewService', MailPreviewService);

  function MailPreviewService($uibModal) {

    return {
      openMailPreviewAsync: openMailPreviewAsyncImpl
    };

    function openMailPreviewAsyncImpl(adminId, teamsOrParticipants, messageType, messageObject) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/messaging/components/mailpreview.html',
        controller: 'MailPreviewModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          teamsOrParticipants: function() {
            return teamsOrParticipants;
          },
          adminId: function() {
            return adminId;
          },
          messageType: function() {
            return messageType;
          },
          messageObject: function() {
            return messageObject;
          }
        }
      });

      return modalInstance.result;
    }

  }


  angular.module('rd.admin.components').controller('MailPreviewModalCtrl', MailPreviewModalCtrl);
  function MailPreviewModalCtrl($uibModalInstance, Constants, fullnameFilter, teamNameMembersFilter, MessageService, ErrorHandler, NotificationService,
                                adminId, teamsOrParticipants, messageType, messageObject) {

    var vm = this;
    vm.messageType = messageType;
    vm.teamsOrParticipants = teamsOrParticipants;
    vm.adminId = adminId;
    vm.messageObject = messageObject;

    vm.cancel = cancel;
    vm.onSelectionChanged = onSelectionChanged;
    vm.sendToMe = sendToMe;

    _activate();

    function _activate() {

      angular.forEach(vm.teamsOrParticipants, function(teamOrParticipant) {
        if (Constants.MESSAGE_TYPE.TEAM === vm.messageType || Constants.MESSAGE_TYPE.DINNER_ROUTE === vm.messageType) {
          teamOrParticipant.previewLabel = teamNameMembersFilter(teamOrParticipant);
        } else {
          teamOrParticipant.previewLabel = fullnameFilter(teamOrParticipant);
        }
      });

      vm.selectedTeamOrParticipant = vm.teamsOrParticipants[0];
      _loadPreviewAsync();
    }

    function _loadPreviewAsync() {
      var previewMessageObject = _getPreparedMessageObject();
      _getMailPreviewPromise(adminId, previewMessageObject)
          .then(function (previewData) {
            vm.previewData = previewData;
          }, function (errorResponse) {
            $uibModalInstance.dismiss(errorResponse);
          });
    }

    function onSelectionChanged(item) {
      _loadPreviewAsync();
    }

    function sendToMe() {
      var messageObject = _getPreparedMessageObject();
      return _getSendToMePromise(adminId, messageObject)
              .then(function() {
                NotificationService.success('mails_send_to_dinner_owner');
              }, function(errorResponse) {
                if (ErrorHandler.isValidationErrorResponse(errorResponse)) {
                  ErrorHandler.handleGlobalHttpError(errorResponse);
                }
              });
    }

    function cancel() {
      $uibModalInstance.close();
    }

    function _getPreparedMessageObject() {
      var messageObjectCopy = angular.copy(vm.messageObject);
      if (Constants.MESSAGE_TYPE.TEAM === vm.messageType || Constants.MESSAGE_TYPE.DINNER_ROUTE === vm.messageType) {
        messageObjectCopy.teamSelection = Constants.TEAM_SELECTION.CUSTOM_SELECTION;
        messageObjectCopy.customSelectedTeamIds = [vm.selectedTeamOrParticipant.id];
      } else {
        messageObjectCopy.participantSelection = Constants.PARTICIPANT_SELECTION.CUSTOM_SELECTION;
        messageObjectCopy.customSelectedParticipantIds = [vm.selectedTeamOrParticipant.id];
      }
      return messageObjectCopy;
    }

    function _getMailPreviewPromise(adminId, previewMessageObject) {
      if (Constants.MESSAGE_TYPE.TEAM === vm.messageType) {
        return MessageService.getTeamArrangementMailPreviewAsync(adminId, previewMessageObject);
      } else if (Constants.MESSAGE_TYPE.DINNER_ROUTE === vm.messageType) {
        return MessageService.getDinnerRouteMailPreviewAsync(adminId, previewMessageObject);
      } else {
        return MessageService.getParticipantMailPreviewAsync(adminId, previewMessageObject);
      }
    }

    function _getSendToMePromise(adminId, messageObject) {
      if (Constants.MESSAGE_TYPE.TEAM === vm.messageType) {
        return MessageService.sendTeamArrangementMailsAsync(adminId, messageObject, true);
      } else if (Constants.MESSAGE_TYPE.DINNER_ROUTE === vm.messageType) {
        return MessageService.sendDinnerRouteMailsAsync(adminId, messageObject, true);
      } else {
        return MessageService.sendParticipantMailsAsync(adminId, messageObject, true);
      }
    }

  }

}(angular));
