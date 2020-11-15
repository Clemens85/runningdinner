(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('RegistrationFinishedCtrl', RegistrationFinishedCtrl);

  function RegistrationFinishedCtrl($state, $scope, BaseController, PublicDinnerEventService) {

    var vm = this;
    vm.dinnerEvent = {};

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    _activate($state.params.publicDinnerId);

    function _activate(publicDinnerId) {
      PublicDinnerEventService.findRunningDinnerByPublicId(publicDinnerId).then(function(response) {
        vm.dinnerEvent = response;
      });
    }
  }

})(angular);



