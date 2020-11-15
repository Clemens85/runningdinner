(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('MessageParticipantCtrl', MessageParticipantCtrl);

  function MessageParticipantCtrl($translate, $state, ParticipantService, MessageService, _, Constants, FormValidationService, CustomSelectionService,
                                  EventHandlerService, MailPreviewService,TriggerFocus, $scope, fullnameFilter, adminId) {


    var FORM_NAME = "ctrl.messageParticipantForm";

    var vm = this;
    vm.sendMails = sendMails;
    vm.previewMails = previewMails;

    vm.openCustomSelectionDialog = openCustomSelectionDialog;

    vm.isAllParticipantsSelected = isAllParticipantsSelected;
    vm.isParticipantsAssignedToTeamsSelected = isParticipantsAssignedToTeamsSelected;
    vm.isParticipantsNotAssignedToTeamsSelected = isParticipantsNotAssignedToTeamsSelected;
    vm.isCustomParticipantsSelected = isCustomParticipantsSelected;

    vm.participantMessage = {
      message: $translate.instant('mails_template_sendparticipants_message'),
      subject: ''
    };

    vm.participantSelectionChoices = [
      { value: Constants.PARTICIPANT_SELECTION.ALL, label: $translate.instant('participant_selection_all') },
      { value: Constants.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM, label: $translate.instant('participant_selection_assigned_to_teams') },
      { value: Constants.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM, label: $translate.instant('participant_selection_not_assigned_to_teams') },
      { value: Constants.PARTICIPANT_SELECTION.CUSTOM_SELECTION, label: $translate.instant('participant_selection_single_selection') }
    ];

    vm.participants = [];
    vm.customSelectedParticipants = [];

    vm.adminId = adminId;
    vm.messageType = Constants.MESSAGE_TYPE.PARTICIPANT;

    _activate();

    function _activate() {
      TriggerFocus('init');
      ParticipantService.findParticipantsAsync(adminId).then(function (participants) {
        vm.participants = participants;
        _watchSelectionChoice();
        if ($state.params.selectAllParticipants === 'true') {
          vm.participantMessage.participantSelection = Constants.PARTICIPANT_SELECTION.ALL;
        }
      });
    }

    function _watchSelectionChoice() {
      $scope.$watch(function() {
        return _.get(vm.participantMessage, 'participantSelection', null);
      }, _onSelectionChoiceChanged);
    }

    function _onSelectionChoiceChanged(newValue) {

      if (isAllParticipantsSelected(newValue)) {
        vm.customSelectedParticipants = [];
        vm.numberOfSelectedParticipants = vm.participants.length;
        return;
      } else if (isCustomParticipantsSelected(newValue)) {
        openCustomSelectionDialog();
        return;
      }

      var assignedParticipants = _.filter(vm.participants, {'assignmentType': Constants.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM});
      var assignedParticipantsSize = assignedParticipants.length;
      if (isParticipantsAssignedToTeamsSelected(newValue)) {
        vm.numberOfSelectedParticipants = assignedParticipantsSize;
      } else if (isParticipantsNotAssignedToTeamsSelected(newValue)) {
        vm.numberOfSelectedParticipants = vm.participants.length - assignedParticipantsSize;
      }
    }

    function openCustomSelectionDialog() {
      return CustomSelectionService
          .openCustomEntitySelectionDialogAsync(vm.participants, vm.customSelectedParticipants, fullnameFilter)
          .then(function(newSelectedParticipants) {
            vm.customSelectedParticipants = newSelectedParticipants;
            if (vm.customSelectedParticipants.length === 0) {
              vm.participantMessage.participantSelection = null;
            }
            return newSelectedParticipants;
          });
    }

    function isAllParticipantsSelected(selectionValue) {
      return selectionValue === Constants.PARTICIPANT_SELECTION.ALL;
    }

    function isParticipantsAssignedToTeamsSelected(selectionValue) {
      return selectionValue === Constants.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM;
    }

    function isParticipantsNotAssignedToTeamsSelected(selectionValue) {
      return selectionValue === Constants.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM;
    }

    function isCustomParticipantsSelected(selectionValue) {
      return selectionValue === Constants.PARTICIPANT_SELECTION.CUSTOM_SELECTION;
    }

    function sendMails() {
      _mapCustomSelectedParticipantsToIds();
      _resetForm();
      return MessageService.sendParticipantMailsAsync(adminId, vm.participantMessage).then(function (createdMessageJob) {
        EventHandlerService.publishMessagesSentEvent(createdMessageJob);
      }, function (errorResponse) {
        _validateForm(errorResponse);
      });
    }

    function previewMails() {
      _resetForm();
      return MailPreviewService
              .openMailPreviewAsync(vm.adminId, vm.participants, vm.messageType, vm.participantMessage)
              .then(function() {},
                    function(errorResponse) {
                      _validateForm(errorResponse);
                    });
    }

    function _mapCustomSelectedParticipantsToIds() {
      if (isCustomParticipantsSelected(vm.participantMessage.participantSelection)) {
        vm.participantMessage.customSelectedParticipantIds = _.map(vm.customSelectedParticipants, "id");
      } else {
        vm.participantMessage.customSelectedParticipantIds = [];
      }
    }

    function _resetForm() {
      FormValidationService.resetForm(FORM_NAME);
    }

    function _validateForm(errorResponse) {
      FormValidationService.validateForm(FORM_NAME, errorResponse);
    }

  }

}(angular));
