(function(angular) {
  'use strict';

  angular.module('AdminApp').controller('ParticipantCtrl', ParticipantCtrl);

  function ParticipantCtrl($scope, $state, $timeout, $translate, $q, _, $transitions, NotificationService, Constants,
                           RunningDinnerService, ParticipantService, MasterDataService, UtilService, ParticipantDeletionViewService, AdminRequests,
                           TeamPartnerWishInfoDialogService, FormValidationService, fullnameFilter, TriggerFocus, adminId) {

    var vm = this;
    var FORM_NAME = "ctrl.participantForm";

    vm.saveParticipant = saveParticipant;
    vm.deleteParticipant = deleteParticipant;

    vm.isNewParticipantState = isNewParticipantState;
    vm.isParticipantSelected = isParticipantSelected;

    vm.fillWithExampleData = fillWithExampleData;

    vm.getParticipantHeadline = getParticipantHeadline;

    vm.getGenderClass = getGenderClass;
    vm.getGenderName = getGenderName;
    vm.getGenderTooltip = getGenderTooltip;

    vm.gotoNewParticipantState = gotoNewParticipantState;

    vm.onMealNoteCheckChanged = onMealNoteCheckChanged;

    vm.getNoAssignableParticipantsMessage = getNoAssignableParticipantsMessage;

    vm.hasNoParticipants = hasNoParticipants;
    vm.hasNotEnoughParticipants = hasNotEnoughParticipants;
    vm.canAssignAllParticipants = canAssignAllParticipants;
    vm.getNumRemainingNotAssignableParticipants = getNumRemainingNotAssignableParticipants;

    vm.participants = [];
    vm.participantsOrganizedInTeams = [];
    vm.participantsNotAssignable = [];
    vm.participantsAssignable = [];

    vm.activeParticipant = null;
    vm.activeParticipantDirty = null;

    vm.selectedParticipantsFilter = 'all';

    vm.genders = {};

    // Functions
    var runningDinnerPromise = RunningDinnerService.findRunningDinnerByAdminIdAsync(adminId);
    var findParticipantsPromise = ParticipantService.findParticipantsAsync(adminId);

    $q
      .all([runningDinnerPromise, findParticipantsPromise])
      .then(function(responses) {
        var runningDinner = responses[0];
        var participants = responses[1];

        vm.runningDinner = runningDinner;
        vm.sessionData = runningDinner.sessionData;
        vm.genders = vm.sessionData.genders;
        vm.numSeatsNeededForHost = vm.sessionData.numSeatsNeededForHost;

        vm.exportUrl = "/rest/participantservice/v1/runningdinner/" + vm.runningDinner.adminId + "/participants/export";

        _assignLoadedParticipantsToView(participants);
      });

    _showListOnlyForSmallDevices();

    function hasNoParticipants() {
      return vm.participantsLoaded === true && vm.participants.length === 0;
    }

    function hasNotEnoughParticipants() {
      if (_hasSearchText()) {
        return false;
      }
      return hasNoParticipants() === false && ParticipantService.getNotAssignableParticipants(vm.participants).length === vm.participants.length;
    }

    function canAssignAllParticipants() {
      if (_hasSearchText()) {
        return false;
      }
      return !hasNoParticipants() && ParticipantService.getNotAssignableParticipants(vm.participants).length === 0;
    }

    function getNumRemainingNotAssignableParticipants() {
      if (hasNotEnoughParticipants()) {
        return 0;
      }
      var assignableParticipants = ParticipantService.getAssignableParticipants(vm.participants);
      var participantsAssignedIntoTeams = ParticipantService.getParticipantsOrganizedInTeams(vm.participants);
      var numAllAssignableParticipants = assignableParticipants.length + participantsAssignedIntoTeams.length;
      return vm.participants.length - numAllAssignableParticipants;
    }

    $scope.$watch('$state.params.participantId', function (value) {
      if (value && value.length > 0) {
        _openParticipantDetailsForm(value);
      }
    });

    $transitions.onSuccess({}, function(transition) {
      if (transition.to().name === 'admin.participants.new') {
        _openNewParticipantForm();
      }
    });

    /*
    function scrollToParticipantSection(anchorId) {
      if (anchorId === vm.ALL_PARTICIPANTS_ANCHOR) {
        vm.numFilteredParticipants = vm.participants.length;
      } else if (anchorId === vm.ASSIGNABLE_PARTICIPANTS_ANCHOR) {
        vm.numFilteredParticipants = vm.participantsOrganizedInTeams.length + vm.participantsAssignable.length;
        anchorId = vm.ALL_PARTICIPANTS_ANCHOR; // Jump always to top in this case
      } else if (anchorId === vm.REMAINING_PARTICIPANTS_ANCHOR) {
        if (vm.participantsOrganizedInTeams.length > 0) {
          vm.numFilteredParticipants = vm.participants.length - vm.participantsOrganizedInTeams.length;
        } else {
          vm.numFilteredParticipants = vm.participants.length - vm.participantsAssignable.length;
        }
      }
      vm.searchText = '';
      $location.hash(anchorId);
      $anchorScroll();
    }
    */

    function _assignLoadedParticipantsToView(participants) {
      vm.participants = ParticipantService.processParticipantsForView(participants, vm.numSeatsNeededForHost);
      vm.participantsLoaded = true;
      _splitParticipants();
    }

    function _hasSearchText() {
      return vm.searchText && vm.searchText.length > 0;
    }

    function _splitParticipants() {
      vm.participantsOrganizedInTeams = ParticipantService.getParticipantsOrganizedInTeams(vm.participants);
      vm.participantsAssignable =  ParticipantService.getAssignableParticipants(vm.participants);
      vm.participantsNotAssignable =  ParticipantService.getNotAssignableParticipants(vm.participants);
    }

    function _openNewParticipantForm() {
      _showFormOnlyForSmallDevices();
      vm.activeParticipant = null;
      runningDinnerPromise.then(function(runningDinner) {
        var newParticipant = ParticipantService.createEmptyParticipantObject(runningDinner);
        _setFormPristine(newParticipant);
      });
    }

    function _openParticipantDetailsForm(participantId) {
      NotificationService.removeAll();
      _showFormOnlyForSmallDevices();
      findParticipantsPromise.then(function(participants) {
        var participant = UtilService.findEntityById(participants, participantId);
        vm.activeParticipant = participant;
        _setFormPristine(participant);
      });
    }

    function _setFormPristine(participant) {
      FormValidationService.resetForm(FORM_NAME);
      if (participant) {
        vm.activeParticipantDirty = angular.copy(participant);
      } else {
        vm.activeParticipantDirty = null;
      }

      $timeout(function() {
        // Needed as timeout-function due to form may not exist till it is opened the first time (after digest cycle)
        _setFormPristineState();
      });
    }

    function _setFormPristineState() {
      var form = vm.participantForm;
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    }

    function gotoNewParticipantState() {
      if (isNewParticipantState()) {
        _openNewParticipantForm();
      } else {
        ParticipantService.gotoNewParticipantView(adminId);
      }
    }

    function getParticipantHeadline(participant) {
      var fullName = fullnameFilter(participant);
      if (!fullName || fullName.length === 0) {
        return $translate.instant('participant_new');
      }
      return fullName;
    }

    function saveParticipant(participant) {
      FormValidationService.resetForm(FORM_NAME);

      return ParticipantService.saveParticipantAsync(adminId, participant)
        .then(function (savedParticipant) {
          return _checkTeamPartnerWish(savedParticipant);
        })
        .catch(function (errorResponse) {
          FormValidationService.validateForm(FORM_NAME, errorResponse);
        })
        .then(function(responseAction) {
          var newEmptyParticipant;
          if (responseAction.participantWithTeamPartnerWishUpdated) {
            var savedParticipantName = fullnameFilter(responseAction.participant);
            var participantWithUpdatedTeamPartnerWishName = fullnameFilter(responseAction.participantWithTeamPartnerWishUpdated);
            var notificationMsg = $translate.instant('participant_teampartnerwish_update_participant', { fullnameThis: savedParticipantName,
                                                                                                                                     fullnameOther: participantWithUpdatedTeamPartnerWishName });
            NotificationService.success(notificationMsg);
          } else if(responseAction.sentInvitationEmail) {
            NotificationService.success($translate.instant('participant_teampartnerwish_sent_invitation', { email: responseAction.sentInvitationEmail }));
          } else if (responseAction.newParticipantToCreate) {
            newEmptyParticipant = ParticipantService.createEmptyParticipantObject(vm.runningDinner);
            newEmptyParticipant = angular.extend(responseAction.newParticipantToCreate, newEmptyParticipant);
            NotificationService.success($translate.instant('participant_teampartnerwish_new_participant'));
          } else {
            ParticipantService.showSuccessMessageParticipantSaved(adminId, responseAction.participant);
          }
          return _reloadParticipantList(newEmptyParticipant);
        });
    }

    function _checkTeamPartnerWish(participant) {
      return ParticipantService.findTeamPartnerWishInfoAsync(participant.id, adminId)
              .then(function(teamPartnerWishInfo) {
                return _handleTeamPartnerWish(teamPartnerWishInfo, participant);
              });
    }

    function _handleTeamPartnerWish(teamPartnerWishInfo, participant) {
      var result = $q.defer();
      if (!teamPartnerWishInfo || !teamPartnerWishInfo.relevant) {
        result.resolve(ParticipantService.noTeamPartnerWishAction(participant));
      } else {
        TeamPartnerWishInfoDialogService
            .openTeamPartnerWishInfoDialogAsync(teamPartnerWishInfo, vm.runningDinner)
            .then(function(responseAction) {
              result.resolve(responseAction);
            }, function() {
              result.resolve(ParticipantService.noTeamPartnerWishAction(participant));
            });
      }
      return result.promise;
    }

    function _reloadParticipantList(participant) {
      _showListOnlyForSmallDevices();
      findParticipantsPromise = ParticipantService.findParticipantsAsync(adminId);
      return findParticipantsPromise.then(function(participants) {
        _assignLoadedParticipantsToView(participants);
        vm.activeParticipant = null; //activeParticipant;
        _setFormPristine(participant);
        ParticipantService.gotoParticipantList(adminId); // This just removes the /new part from URL
        if (participant) {
          _showFormOnlyForSmallDevices();
        }
      });
    }

    function getNoAssignableParticipantsMessage() {
      var minSizeNeeded = _.get(vm, 'sessionData.assignableParticipantSizes.minimumParticipantsNeeded', '') || '';
      var missingParticipants = '';
      if (minSizeNeeded !== '') {
        missingParticipants = minSizeNeeded - vm.participants.length;
      }
      var msg = $translate.instant('participants_too_few_text', { minSizeNeeded: minSizeNeeded, missingParticipants: missingParticipants});
      return msg;
    }

    function deleteParticipant(participant) {
      return ParticipantDeletionViewService
              .openParticipantDeletionDialogAsync(participant, adminId)
              .then(function() {
                return _reloadParticipantList();
              })
              .then(function() {
                ParticipantService.gotoParticipantList(adminId);
              });
    }

    function isParticipantSelected(participant) {
      return UtilService.isSameEntity(vm.activeParticipant, participant);
    }

    function isNewParticipantState() {
      return ParticipantService.isNewParticipantState($state);
    }

    function fillWithExampleData() {
      vm.activeParticipantDirty = ParticipantService.fillWithExampleData(vm.activeParticipantDirty);
    }

    function getGenderClass(gender) {
      var result = MasterDataService.getGenderClass(gender);
      result += " fa fa-fw";
      return result;
    }

    function getGenderName(gender) {
      return MasterDataService.getGenderName(gender);
    }

    function getGenderTooltip(gender) {
      return vm.getGenderName(gender);
    }

    function onMealNoteCheckChanged() {
      if (vm.activeParticipantDirty.mealnote_checked === true) {
        TriggerFocus('mealNoteEnabled');
      } else {
        vm.activeParticipantDirty.mealSpecificsNote = ''; // Reset text input field
      }
    }

    function _showListOnlyForSmallDevices() {
      vm.hideFormForSmallDevicesClass = 'hidden-xs hidden-sm';
      vm.hideListForSmallDevicesClass = '';
    }

    function _showFormOnlyForSmallDevices() {
      vm.hideFormForSmallDevicesClass = '';
      vm.hideListForSmallDevicesClass = 'hidden-xs hidden-sm';
    }
  }

})(angular);
