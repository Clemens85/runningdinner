(function(angular) {
  'use strict';

  angular.module('rd.common.components').component('feedback', {
    controller : FeedbackLinkCtrl,
    template:
      '<applink-container><a href ng-click="$ctrl.openFeedbackDialogAsync()"><span translate="feedback_label"></span></a></applink-container>\n'
  });

  function FeedbackLinkCtrl($uibModal, $q, NotificationService) {

    var ctrl = this;
    ctrl.openFeedbackDialogAsync = openFeedbackDialogAsyncImpl;

    function openFeedbackDialogAsyncImpl() {

      var result = $q.defer();

      var modalInstance = $uibModal.open({
        templateUrl: 'common/components/feedback/feedbackdialog.html?v=@@buildno@@',
        controller: 'FeedbackDialogCtrl',
        controllerAs: 'ctrl'
      });

      modalInstance.result.then(function (response) {
        NotificationService.success('feedback_success');
        result.resolve(response);
      }, function () {
        result.resolve();
      });

      return result.promise;
    }
  }

  angular.module('rd.common.components').controller('FeedbackDialogCtrl', FeedbackDialogCtrl);
  function FeedbackDialogCtrl($uibModalInstance, FormValidationService, Constants, FeedbackService) {

    var FORM_NAME = "ctrl.feedbackForm";

    var ctrl = this;
    ctrl.save = saveImpl;
    ctrl.cancel = cancelImpl;

    ctrl.impressumLink = Constants.IMPRESSUM_LINK;

    _activate();

    function saveImpl() {
      _resetForm();
      return FeedbackService.createFeedbackAsync(ctrl.feedback)
          .then(function(response) {
                $uibModalInstance.close(response);
                return response;
              }, function (errorResponse) {
                _validateForm(errorResponse);
              }
          );
    }

    function cancelImpl() {
      $uibModalInstance.dismiss();
    }

    function _activate() {
      ctrl.feedback = FeedbackService.newFeedbackModel();
      _resetForm();
    }

    function _resetForm() {
      FormValidationService.resetForm(FORM_NAME);
    }

    function _validateForm(errorResponse) {
      FormValidationService.validateForm(FORM_NAME, errorResponse);
    }

  }

})(angular);
