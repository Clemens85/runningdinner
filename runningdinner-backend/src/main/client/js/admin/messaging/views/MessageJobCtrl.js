(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('MessageJobCtrl', MessageJobCtrl);

  function MessageJobCtrl($sce, MessageService, ReSendMessageTaskService, _, UtilService, Constants, $scope, $state, $translate, adminId) {

    var vm = this;
    vm.openMessageTaskDetails = openMessageTaskDetails;
    vm.reSendMessage = reSendMessage;
    vm.mapNewLineToHtmlLineBreaks = UtilService.mapNewLineToHtmlLineBreaks;

    vm.loadingMessageTasks = true;
    vm.loadingMessageJob = true;

    vm.messageTasks = [];
    vm.messageJobHeadline = "";

    vm.messageJobId = $state.params.messageJobId;

    _showListOnlyForSmallDevices();

    $scope.$watch('$state.params.messageJobId', function (value) {
      if (value && value.length > 0) {
        _findMessageTasks(value);
      }
    });

    function openMessageTaskDetails(messageTask) {
      _showDetailsOnlyForSmallDevices();
      vm.selectedMessageTask = messageTask;
    }

    function reSendMessage(messageTask) {
      return ReSendMessageTaskService
          .reSendMessageTaskAsync(adminId, messageTask)
          .then(function(reSendMessageTask) {
            if (reSendMessageTask) {
              return _findMessageTasks($state.params.messageJobId);
            }
          });
    }

    function _findMessageTasks(messageJobId) {

      vm.findMessageTasksPromise = MessageService.findMessageTasksByAdminIdAndMessageJobIdAsync(adminId, messageJobId);
      vm.findMessageTasksPromise
        .then(_applyMessageTasksToView)
        .finally(function() {
          vm.loadingMessageTasks = false;
        });

      vm.messageJobPromise = MessageService.findMessageJobByAdminIdAndMessageJobIdAsync(adminId, messageJobId);
      vm.messageJobPromise
        .then(_applyMessageJobToView)
        .finally(function() {
          vm.loadingMessageJob = false;
        });
    }

    function _applyMessageTasksToView(messageTasks) {
      vm.messageTasks = messageTasks;
      angular.forEach(vm.messageTasks, function(messageTask) {
        messageTask.messageTeaser = _getMessageTeaser(messageTask.message);
        _applyMessageTaskSendingResult(messageTask);
      });
    }

    function _applyMessageJobToView(messageJob) {
      vm.messageJob = messageJob;
      var i18nKey = _.toLower("messagejob_type_" + messageJob.messageType);
      vm.messageJobHeadline = $translate.instant('protocols_transfer_headline_prefix') + $translate.instant(i18nKey);
    }

    function _applyMessageTaskSendingResult(messageTask) {
      var statusResult = MessageService.getStatusResult(messageTask);
      messageTask.statusResultMessage = $translate.instant(statusResult);

      if (statusResult === Constants.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE) {
        var failureMessage = _.get(messageTask, "sendingResult.failureMessage", "");
        messageTask.failureReportMessage = failureMessage;
        var failureType = _.get(messageTask, "sendingResult.failureType", "UNKNOWN");
        messageTask.failureTypeMessage = $translate.instant("FAILURE_TYPE_" + failureType);
        messageTask.failureDate = _.get(messageTask, "sendingResult.delieveryFailedDate", null);
      }
    }

    function _getMessageTeaser(message) {
      var result = "<strong>" + message.subject+ "</strong><br />";
      result += UtilService.getTruncatedText(message.content, 48);
      result = UtilService.mapNewLineToHtmlLineBreaks(result);
      return $sce.trustAsHtml(result);
    }

    function _showListOnlyForSmallDevices() {
      vm.hideDetailsForSmallDevicesClass = 'hidden-xs hidden-sm';
      vm.hideListForSmallDevicesClass = '';
    }

    function _showDetailsOnlyForSmallDevices() {
      vm.hideDetailsForSmallDevicesClass = '';
      vm.hideListForSmallDevicesClass = 'hidden-xs hidden-sm';
    }

  }

}(angular));
