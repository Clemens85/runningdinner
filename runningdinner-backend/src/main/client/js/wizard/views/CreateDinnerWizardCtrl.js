(function(angular) {
  'use strict';

  angular.module('WizardApp').controller('CreateDinnerWizardCtrl', CreateDinnerWizardCtrl);

  function CreateDinnerWizardCtrl($scope, $q, $state, BaseController, MasterDataService, $transitions,
                                  CreateWizardService, FormValidationService, Constants,
                                  WizardNavigationStates, LocaleHandlerService, WizardNavigationService, _) {

    var vm = this;
    var FORM_NAME_BASIC_STEPS = "ctrl.basicStepsForm";
    var FORM_NAME_OPTIONS = "ctrl.optionsForm";
    var FORM_NAME_PUBLIC_SETTINGS = "ctrl.publicSettingsForm";
    var FORM_NAME_FINISH = "ctrl.finishForm";

    vm.changeEventLanguage = changeEventLanguageImpl;

    vm.isStepReached = WizardNavigationService.isStepReached;
    vm.isDinnerCreated = isDinnerCreated;

    vm.isClosedDinner = isClosedDinner;
    vm.addMeal = addMeal;
    vm.removeMeal = removeMeal;

    vm.getMinimumParticipantsNeeded = CreateWizardService.getMinimumParticipantsNeeded;

    vm.submitOptions = submitOptions;
    vm.submitMealTimes = submitMealTimes;
    vm.submitBasicDetails = submitBasicDetails;
    vm.submitPublicSettings = submitPublicSettings;
    vm.submitParticipantPreview = submitParticipantPreview;
    vm.submitParticipantsUpload = submitParticipantsUpload;
    vm.skipParticipantUpload = skipParticipantUpload;
    vm.submitEmail = submitEmail;

    vm.getDynamicMealTimesButtonRowColumnClasses = getDynamicMealTimesButtonRowColumnClasses;

    vm.getRegistrationTypeDescription = getRegistrationTypeDescription;

    vm.globalAdminEmail = Constants.GLOBAL_ADMIN_EMAIL;

    _activate();

    function _activate() {

      BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

      vm.registrationTypes = [];
      vm.genderAspects = [];

      vm.dinner = CreateWizardService.createWizardDinnerModel(_isDemoDinner());

      vm.wizardNavigationStates = WizardNavigationService.getVisibleStates(vm.dinner);

      vm.datepicker = {
        dinnerDateCalendarOpened: false,
        endOfRegistrationDateCalendarOpened: false,
        dateFormat: LocaleHandlerService.getLanguageSpecificDateFormat(),
        openDinnerDateCalendar: function() {
          vm.datepicker.dinnerDateCalendarOpened = true;
        },
        openEndOfRegistrationDateCalendar: function() {
          vm.datepicker.endOfRegistrationDateCalendarOpened = true;
        },
        today: function() {
          return new Date();
        }
      };

      MasterDataService.loadRegistrationTypes().then(function (response) {
        vm.registrationTypes = response;
        if (!vm.dinner.basicDetails.registrationType) {
          vm.dinner.basicDetails.registrationType = Constants.REGISTRATION_TYPE.CLOSED;
        }
      });

      MasterDataService.loadGenderAspects().then(function (response) {
        vm.genderAspects = response;
        vm.dinner.options.genderAspects = vm.genderAspects[0].value;
      });
    }

    function getRegistrationTypeDescription(registrationTypeValue) {
      if (registrationTypeValue) {
        var foundRegistrationType = _.find(vm.registrationTypes, ['value', registrationTypeValue]);
        if (foundRegistrationType) {
          return foundRegistrationType.description;
        }
      }
    }

    // If user uses browser back to return to summary view, we redirect him to start of wizard:
    $transitions.onSuccess({}, function(transition) {
      if (WizardNavigationStates.SUMMARY_STATE.name === transition.to().name && !isDinnerCreated()) {
        BaseController.gotoState(WizardNavigationStates.BASIC_STATE.name);
      }
    });

    function isClosedDinner() {
      return CreateWizardService.isClosedDinner(vm.dinner);
    }

    function addMeal() {
      CreateWizardService.addMeal(vm.dinner);
    }

    function removeMeal() {
      CreateWizardService.removeMeal(vm.dinner);
    }

    function submitOptions(next) {
      _submitOptionsPromise().then(function () {
        WizardNavigationService.navigate(vm.dinner, next);
      });
    }

    function submitMealTimes(next) {
      // This is the same backend service for submitting options:
      _submitOptionsPromise().then(function () {
        WizardNavigationService.navigate(vm.dinner, next);
      });
    }

    function submitBasicDetails() {
      _resetForms();
      CreateWizardService.validateBasicDetails(vm.dinner)
        .then(function () {
          vm.wizardNavigationStates = WizardNavigationService.getVisibleStates(vm.dinner);
          WizardNavigationService.navigate(vm.dinner, true);
        }, function(errorResponse) {
          _defaultErrorHandler(errorResponse, FORM_NAME_BASIC_STEPS);
        });
    }

    function submitParticipantPreview(next) {
      WizardNavigationService.navigate(vm.dinner, next);
    }

    function submitPublicSettings(next) {
      _resetForms();
      var submitPromise = _isNext(next) ? CreateWizardService.validatePublicSettings(vm.dinner) : _emptyPromise();
      submitPromise.then(function () {
        WizardNavigationService.navigate(vm.dinner, next);
      }, function(errorResponse) {
        _defaultErrorHandler(errorResponse, FORM_NAME_PUBLIC_SETTINGS);
      });
    }

    function submitEmail(next) {
      _resetForms();
      var submitPromise = _isNext(next) ? CreateWizardService.createRunningDinner(vm.dinner) : _emptyPromise();
      return submitPromise.then(function (response) {
        vm.dinner.administrationUrl = response;
        WizardNavigationService.navigate(vm.dinner, next);
      }, function(errorResponse) {
        _defaultErrorHandler(errorResponse, FORM_NAME_FINISH);
      });
    }

    function isDinnerCreated() {
      var administrationUrl = vm.dinner.administrationUrl || '';
      var result = administrationUrl.length > 0;
      return result;
    }

    function getDynamicMealTimesButtonRowColumnClasses() {
      var numMeals = vm.dinner.options.meals.length;
      var smColumns = numMeals * 2;
      return "col-xs-12 col-sm-" + smColumns;
    }

    function changeEventLanguageImpl(languageCode) {
      vm.dinner.basicDetails.languageCode = languageCode;
    }

    function _submitOptionsPromise() {
      _resetForms();
      var result = $q.defer();
      CreateWizardService.validateOptions(vm.dinner)
        .then(function (response) {
          result.resolve(response);
        }, function (errorResult) {
          _defaultErrorHandler(errorResult, FORM_NAME_OPTIONS);
          result.reject(errorResult);
        });
      return result.promise;
    }

    function _defaultErrorHandler(errorResult, formName) {
      FormValidationService.validateForm(formName, errorResult);
    }

    function _resetForms() {
      FormValidationService.resetForm(FORM_NAME_BASIC_STEPS);
      FormValidationService.resetForm(FORM_NAME_OPTIONS);
      FormValidationService.resetForm(FORM_NAME_PUBLIC_SETTINGS);
      FormValidationService.resetForm(FORM_NAME_FINISH);
    }

    function _emptyPromise() {
      var result = $q.defer();
      result.resolve();
      return result.promise;
    }

    function _isNext(next) {
      return next === true;
    }

    function _isDemoDinner() {
      if ($state.params.demoDinner === 'true') {
        return true;
      }
      return false;
    }

    function submitParticipantsUpload() {
      _resetForms();
      if (vm.upload.isFileUploadedSuccess() && !vm.upload.isFileUploadParsedSuccess()) {
        vm.upload.parseUploadedParticipantFile();
      } else if (vm.upload.isFileUploadedSuccess() && vm.upload.isFileUploadParsedSuccess()) {
        vm.upload.activatePreviewFinalResultControls();
        WizardNavigationService.navigate(vm.dinner, true);
      } else {
        // ErrorHandler.raiseClientError($scope, "error_file_upload_missing_file", Constants.ISSUE_TYPE.VALIDATION, "fileUpload");
      }
    }

    function skipParticipantUpload() {
      BaseController.gotoState(WizardNavigationStates.FINISH_STATE.name);
    }
  }

})(angular);
