(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('PublicDinnerEventDetailsCtrl', PublicDinnerEventDetailsCtrl);

  function PublicDinnerEventDetailsCtrl($scope, $state, $transitions, BaseController, PublicDinnerEventService, UtilService,
                                        LocaleHandlerService) {

    var vm = this;
    vm.dinnerEvent = {};
    vm.registrationButtonHidden = false;

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    _activate();

    function _activate() {
      vm.participantSubscribed = $state.params.participantSubscribed === "true";
      if (_isRegistrationFormVisible()) {
        _onOpenEventRegistrationForm();
      } else {
        _onOpenEventDetails();
      }
    }

    $transitions.onSuccess({}, function(transition) {
      if ('frontend.eventdetails.registration' === transition.to().name) {
        _onOpenEventRegistrationForm();
      } else {
        _onOpenEventDetails();
      }
    });

    // if detail state change - show or hide detail section
    $scope.$watch('$state.params.publicDinnerId', function (value) {
      if (value && value.length > 0) {
        _showDinnerEventDetails(value);
      }
    });

    function _onOpenEventRegistrationForm() {
      vm.showButtons = false;
      vm.hideDetailsOnRegistrationForSmallDevicesClass = 'hidden-xs hidden-sm';
    }

    function _onOpenEventDetails() {
      vm.showButtons = true;
      vm.hideDetailsOnRegistrationForSmallDevicesClass = '';
    }

    function _showDinnerEventDetails(publicDinnerId) {
      vm.dinnerEvent.loading = true;
      PublicDinnerEventService.findRunningDinnerByPublicId(publicDinnerId).then(function(response) {
        vm.dinnerEvent = response;
        vm.dinnerEvent.found = true;
        vm.dinnerEvent.publicDinnerId = publicDinnerId;
        vm.dinnerEvent.locationText = _getLocation(vm.dinnerEvent);
        vm.registrationButtonHidden = vm.dinnerEvent.registrationDateExpired || vm.dinnerEvent.publicSettings.registrationDeactivated || vm.participantSubscribed === true;
        vm.dinnerEvent.publicContactInfoAvailable = _isPublicContactInfoAvailable(vm.dinnerEvent.publicSettings);
        LocaleHandlerService.setCurrentLanguageFromRunningDinner(vm.dinnerEvent);
      }).finally(function() {
        vm.dinnerEvent.loading = false;
      });
    }

    function _isRegistrationFormVisible() {
      return $state.current.name === 'frontend.eventdetails.registration';
    }

    function _getLocation(dinnerEvent) {
      return dinnerEvent.zip + " " + dinnerEvent.city;
    }

    function _isPublicContactInfoAvailable(publicSettings) {
      return UtilService.isNotEmptyString(publicSettings.publicContactName) || UtilService.isNotEmptyString(publicSettings.publicContactEmail) || UtilService.isNotEmptyString(publicSettings.publicContactMobileNumber);
    }
  }

})(angular);
