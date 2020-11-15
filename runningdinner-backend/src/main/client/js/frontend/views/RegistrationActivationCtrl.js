(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('RegistrationActivationCtrl', RegistrationActivationCtrl);

  function RegistrationActivationCtrl($state, $scope, BaseController, Constants, UtilService, _, ErrorHandler, PublicDinnerEventService) {

    var vm = this;
    vm.activationSucceeded = false;
    vm.activationFailed = false;
    vm.dinnerEvent = {};

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    vm.publicDinnerId = $state.params.publicDinnerId;
    vm.participantId = $state.params.participantId;

    _activate();

    function _activate() {

      _findPublicDinner();

      vm.loading = true;
      PublicDinnerEventService.activateSubscribedParticipantAsync(vm.participantId, vm.publicDinnerId).then(function() {
        vm.activationSucceeded = true;
      })
      .catch(function(errorResponse) {
        if (ErrorHandler.isValidationErrorResponse(errorResponse)) {
          vm.validationErrorMessage = ErrorHandler.getSingleTranslatedIssueMessageFromResponse(errorResponse);
        }
        vm.activationFailed = true;
      })
      .finally(function() {
        vm.loading = false;
      });
    }

    function _findPublicDinner() {
      PublicDinnerEventService.findRunningDinnerByPublicId(vm.publicDinnerId).then(function(response) {
        vm.dinnerEvent = response;
        vm.dinnerEvent.publicSettings.publicDinnerUrl = UtilService.appendUrlQueryParams(vm.dinnerEvent.publicSettings.publicDinnerUrl, 'participantSubscribed=true');
      })
      .finally(function() {
        vm.activationErrorEmail = _.get(vm, "dinnerEvent.publicSettings.adminEmail", Constants.GLOBAL_ADMIN_EMAIL);
      });
    }
  }

})(angular);



