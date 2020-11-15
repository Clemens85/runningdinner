(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('PublicDinnerEventRegistrationCtrl', PublicDinnerEventRegistrationCtrl);

  function PublicDinnerEventRegistrationCtrl($scope, $state, BaseController, FormValidationService, PublicDinnerEventService,
                                             RegistrationSummaryViewService, MasterDataService, Constants, TriggerFocus) {

    var FORM_NAME = "ctrl.registrationForm";

    var vm = this;
    vm.dinnerEvent = {};
    vm.registrationData = {
      gender: Constants.GENDER.UNDEFINED
    };
    vm.registrationSummary = {};
    vm.registrationFormOpened = true;

    vm.privacyLink = $state.href('frontend.impressum');

    vm.validateRegistration = validateRegistration;

    vm.getGenderClass = getGenderClass;
    vm.getGenderName = getGenderName;

    vm.mealNoteCheckChanged = mealNoteCheckChanged;

    if ($state.params.invitingParticipantEmail) {
      vm.registrationData.teamPartnerWish = decodeURI($state.params.invitingParticipantEmail);
      vm.registrationData.email = decodeURI($state.params.prefilledEmailAddress);
    }

    $scope.$state = $state;
    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    TriggerFocus('init');

    _activate();

    function _activate() {
      var publicDinnerId = $state.params.publicDinnerId;
      PublicDinnerEventService.findRunningDinnerByPublicId(publicDinnerId).then(function(response) {
        vm.dinnerEvent = response;
        vm.dinnerEvent.found = true;
        vm.dinnerEvent.publicDinnerId = publicDinnerId;
      });
    }

    // $scope.$watch('$state.params.publicDinnerId', function (value) {
    //   vm.dinnerEvent.publicDinnerId = value;
    //   _fetch
    // });

    function getGenderClass(gender) {
      var result = MasterDataService.getGenderClass(gender);
      result += " fa fa-fw";
      return result;
    }

    function getGenderName(gender) {
      return MasterDataService.getGenderName(gender);
    }

    function openRegistrationSummaryView(registrationSummary) {
      vm.registrationSummary = registrationSummary;
      FormValidationService.resetForm(FORM_NAME);
      RegistrationSummaryViewService.openRegistrationSummaryDialog(vm.dinnerEvent.publicDinnerId, vm.registrationData, registrationSummary,
          function() {
            $state.go('frontend.registrationfinished', {
              "publicDinnerId": vm.dinnerEvent.publicDinnerId
            });
          },
          function (errorResult) {
            FormValidationService.validateForm(FORM_NAME, errorResult);
          }
      );
    }

    function validateRegistration() {
      FormValidationService.resetForm(FORM_NAME);
      PublicDinnerEventService.performRegistrationValidation(vm.dinnerEvent.publicDinnerId, vm.registrationData).then(function(response) {
        openRegistrationSummaryView(response);
      }, function(errorResponse) {
        FormValidationService.validateForm(FORM_NAME, errorResponse);
      });
    }

    function mealNoteCheckChanged() {
      if (vm.registrationData.mealnote_checked === true) {
        TriggerFocus('mealNoteEnabled');
      } else {
        vm.registrationData.mealnote = ''; // Reset text input field
      }
    }

  }

})(angular);
