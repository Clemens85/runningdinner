(function(angular) {
  'use strict';

  angular.module('rd.admin.components').component('messageJobsOverview', {
    bindings : {
      adminId: '<',
      messageType: '<'
    },
    controller : MessageJobsOverviewCtrl,
    templateUrl : 'admin/messaging/components/messagejobsoverview.html?v=@@buildno@@'
  });

  function MessageJobsOverviewCtrl(MessageService, EventHandlerService, Constants, $timeout, $q, $scope, _, BaseController) {

    var ctrl = this;
    ctrl.messageJobs = [];

    ctrl.openInNewWindow = openInNewWindow;

    ctrl.$onInit = function() {
      _activate();
    };

    function _activate() {

      ctrl.findMessageJobsByTypePromise = MessageService.findMessageJobsByTypeAsync(ctrl.adminId, ctrl.messageType);
      ctrl.findMessageJobsByTypePromise
        .then(_applyMessageJobsToView)
        .finally(function() {
          ctrl.loadingData = false;
        });

      EventHandlerService.onMessagesSentEvent($scope, function(createdMessageJob) {
        ctrl.messageJobs.push(createdMessageJob);
        _pollNextMessageJobs();
      });
    }

    function _applyMessageJobsToView(messageJobs) {
      ctrl.messageJobs = messageJobs;
      var notFinishedMessageJobs = _.filter(messageJobs, function(messageJob) {
        return messageJob.sendingStatus !== Constants.SENDING_STATUS.SENDING_FINISHED;
      });
      if (notFinishedMessageJobs.length > 0) {
        _pollNextMessageJobs();
      }
      ctrl.lastPollDate = new Date();
    }

    function _findMessageJobsAsync() {
      MessageService
          .findMessageJobsByTypeAsync(ctrl.adminId, ctrl.messageType)
          .then(_applyMessageJobsToView)
          .catch(function() {
            _pollNextMessageJobs(3500);
          });
    }

    function _pollNextMessageJobs(offsetMillisOnError) {
      var offsetMillis = offsetMillisOnError || 1500;
      _cancelPollMessageJobs();
      ctrl.pollPromise = $timeout(_findMessageJobsAsync, offsetMillis);
    }

    function _cancelPollMessageJobs() {
      if (ctrl.pollPromise) {
        $timeout.cancel(ctrl.pollPromise);
      }
    }
    $scope.$on('$destroy', function() {
      _cancelPollMessageJobs();
    });

    function openInNewWindow(messageJob) {
      BaseController.openInNewWindow('admin.messagejobs.details', { messageJobId: messageJob.id });
    }
  }

})(angular);
