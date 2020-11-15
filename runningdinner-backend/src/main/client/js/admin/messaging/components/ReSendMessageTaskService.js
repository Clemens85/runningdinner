(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('ReSendMessageTaskService', ReSendMessageTaskService);

  function ReSendMessageTaskService($uibModal) {

    return {
      reSendMessageTaskAsync: reSendMessageTaskAsyncImpl
    };

    function reSendMessageTaskAsyncImpl(adminId, messageTask) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/messaging/components/resendmessagetaskdialog.html?v=@@buildno@@',
        controller: 'ReSendMessageTaskServiceModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          adminId: function() {
            return adminId;
          },
          messageTask: function() {
            return angular.copy(messageTask);
          }
        }
      });

      return modalInstance.result;
    }
  }


  angular.module('rd.admin.components').controller('ReSendMessageTaskServiceModalCtrl', ReSendMessageTaskServiceModalCtrl);
  function ReSendMessageTaskServiceModalCtrl($uibModalInstance, MessageService, NotificationService, FormValidationService,
                                             adminId, messageTask) {

    var FORM_NAME = "ctrl.reSendTaskForm";

    var vm = this;
    vm.messageTask = messageTask;
    vm.adminId = adminId;

    vm.cancel = cancel;
    vm.save = save;

    _resetForm();

    function save() {
      _resetForm();
      return MessageService.reSendMessageTaskAsync(vm.adminId, vm.messageTask)
              .then(function(response) {
                  NotificationService.success('Nachricht erneut versandt!');
                  $uibModalInstance.close(response);
                  return response;
                }, function (errorResponse) {
                  _validateForm(errorResponse);
                }
            );
    }

    function cancel() {
      $uibModalInstance.close();
    }

    function _resetForm() {
      FormValidationService.resetForm(FORM_NAME);
    }

    function _validateForm(errorResponse) {
      FormValidationService.validateForm(FORM_NAME, errorResponse);
    }
  }

}(angular));
