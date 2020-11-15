(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('SettingsCtrl', SettingsCtrl);

  function SettingsCtrl(RunningDinnerService, MasterDataService, FormValidationService, CancelEventViewService, LocaleHandlerService,
                        NotificationService, ConfirmationDialogService, BasicDetailsUpdatePreviewService, $translate, $state, _, adminId) {

    var vm = this;
    vm.getRegistrationTypeDescription = getRegistrationTypeDescriptionImpl;
    vm.saveBasicDetails = saveBasicDetailsImpl;
    vm.savePublicSettings = savePublicSettingsImpl;
    vm.updateRegistrationActiveState = updateRegistrationActiveStateImpl;
    vm.cancelEvent = cancelEventImpl;
    vm.isClosedDinner = isClosedDinnerImpl;
    vm.changeEventLanguage = changeEventLanguageImpl;
    vm.adminId = adminId;

    var BASIC_DETAILS_FORM = "ctrl.basicDetailsForm";
    var PUBLIC_SETTINGS_FORM = "ctrl.publicSettingsForm";

    var runningDinnerPromise;

    _activate();

    function _activate() {

      MasterDataService.loadRegistrationTypes().then(function (response) {
        vm.registrationTypes = response;
      });

      runningDinnerPromise = RunningDinnerService.findRunningDinnerByAdminIdAsync(adminId);
      runningDinnerPromise.then(_setDinnerToView);

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

      _resetForms();
    }

    function saveBasicDetailsImpl() {
      _resetForms(BASIC_DETAILS_FORM);
      return BasicDetailsUpdatePreviewService
              .showBasicDetailsUpdatePreviewAsync(vm.dinnerPristine, vm.dinner)
              .then(function(shouldNotifyParticipants) {
                return _updateBasicSettings(shouldNotifyParticipants);
              });
    }

    function _updateBasicSettings(shouldNotifyParticipants) {
      return RunningDinnerService.updateBasicSettingsAsync(vm.adminId, vm.dinner)
              .then(_setDinnerToView)
              .then(function() {
                _showBasicSettingsUpdatedSuccessMessage(shouldNotifyParticipants);
              }, function(errorResponse) {
                _handleValidationErrors(errorResponse, BASIC_DETAILS_FORM);
              });
    }

    function savePublicSettingsImpl() {
      _resetForms(PUBLIC_SETTINGS_FORM);
      return RunningDinnerService.updatePublicSettingsAsync(vm.adminId, vm.dinner.publicSettings)
          .then(_setDinnerToView)
          .then(function() {
            NotificationService.success("settings_saved_success");
          }, function(errorResponse) {
            _handleValidationErrors(errorResponse, PUBLIC_SETTINGS_FORM);
          });
    }

    function updateRegistrationActiveStateImpl(enable) {

      var title = 'deactivate_registration';
      var message = 'deactivate_registration_confirmation_text';
      if (enable === true) {
        title = 'activate_registration';
        message = 'activate_registration_confirmation_text';
      }

      return ConfirmationDialogService
              .openConfirmationDialog(title, message)
              .then(function() {
                return RunningDinnerService.updateRegistrationActiveStateAsync(vm.adminId, enable);
              })
              .then(_setDinnerToView)
              .then(function() {
                NotificationService.success("settings_saved_success");
              });
    }

    function cancelEventImpl(runningDinner) {
      return CancelEventViewService.openCancelEventDialogAsync(runningDinner).then(function() {
        $state.go('admin.mails-participants', {"adminId": vm.adminId, "selectAllParticipants": true}, { reload: true, notify: true });
      });
    }

    function getRegistrationTypeDescriptionImpl(registrationTypeValue) {
      if (registrationTypeValue) {
        var foundRegistrationType = _.find(vm.registrationTypes, ['value', registrationTypeValue]);
        if (foundRegistrationType) {
          return foundRegistrationType.description;
        }
      }
    }

    function isClosedDinnerImpl(runningDinner) {
      if (runningDinner) {
        return RunningDinnerService.isClosedDinner(runningDinner);
      }
    }

    function changeEventLanguageImpl(languageCode) {
      vm.dinner.basicDetails.languageCode = languageCode;
    }

    function _showBasicSettingsUpdatedSuccessMessage(shouldNotifyParticipants) {
      var successMessage = $translate.instant('settings_saved_success');
      if (shouldNotifyParticipants === true) {
        var participantMessagesLink = $state.href('admin.mails-participants', { "adminId": adminId, "selectAllParticipants": true });
        var participantMessagesText = $translate.instant('mails_participant_sendmessage_button');
        successMessage += "<br><a style='text-decoration: underline;' href='" + participantMessagesLink + "'><strong>" + participantMessagesText + "</strong></a>";
      }
      NotificationService.success(successMessage);
    }

    function _resetForms(formName) {
      if (!formName || formName === BASIC_DETAILS_FORM) {
        FormValidationService.resetForm(BASIC_DETAILS_FORM);
      }
      if (!formName || formName === PUBLIC_SETTINGS_FORM) {
        FormValidationService.resetForm(PUBLIC_SETTINGS_FORM);
      }
    }

    function _handleValidationErrors(errorResponse, formName) {
      if (formName === BASIC_DETAILS_FORM) {
        FormValidationService.validateForm(BASIC_DETAILS_FORM, errorResponse);
      }
      if (formName === PUBLIC_SETTINGS_FORM) {
        FormValidationService.validateForm(PUBLIC_SETTINGS_FORM, errorResponse);
      }
    }

    function _setDinnerToView(incomingDinner) {
      vm.dinner = incomingDinner;
      vm.dinnerPristine = angular.copy(vm.dinner);
    }

  }

}(angular));
