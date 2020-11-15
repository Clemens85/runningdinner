(function(angular) {
  'use strict';

  angular.module('rd.admin.services').service('ParticipantService', ParticipantService);

  function ParticipantService($translate, $state, RestClientService, Constants, AdminRequests, NotificationService, UtilService,
                              MasterDataService, BaseController, fullnameFilter, _) {

    var teamPartnerWishActionTemplate = {
      participant: null,
      newParticipantToCreate: null,
      sentInvitationEmail: null,
      participantWithTeamPartnerWishUpdated: null
    };

    var exampleParticipant = {
      firstnamePart: 'Max',
      lastname: 'Mustermann',
      gender: Constants.GENDER.MALE,
      email: 'Max@Mustermann.de',
      street: 'Musterstraße',
      streetNr: '1',
      age: 25,
      numberSeats: 6
    };

    var PARTICIPANT_LIST_STATE_NAME = 'admin.participants';
    var NEW_PARTICIPANT_STATE_NAME = PARTICIPANT_LIST_STATE_NAME + '.new';
    var PARTICIPANT_DETAILS_STATE_NAME = PARTICIPANT_LIST_STATE_NAME + '.details';

    return {
      saveParticipantAsync: saveParticipantAsyncImpl,
      findParticipantsAsync: findParticipantsAsyncImpl,
      findNotAssignedParticipantsAsync: findNotAssignedParticipantsAsyncImpl,
      findNotActivatedParticipantsAsync: findNotActivatedParticipantsAsyncImpl,

      findTeamPartnerWishInfoAsync: findTeamPartnerWishInfoAsyncImpl,

      updateParticipantSubscriptionAsync: updateParticipantSubscriptionAsyncImpl,

      getNotAssignableParticipants: getNotAssignableParticipantsImpl,
      getAssignableParticipants: getAssignableParticipantsImpl,
      getParticipantsOrganizedInTeams: getParticipantsOrganizedInTeamsImpl,

      createEmptyParticipantObject: createEmptyParticipantObjectImpl,

      processParticipantsForView: processParticipantsForViewImpl,

      showSuccessMessageParticipantSaved: showSuccessMessageParticipantSavedImpl,

      fillWithExampleData: fillWithExampleDataImpl,

      deleteParticipantAsync: deleteParticipantAsyncImpl,

      gotoParticipantDetails: gotoParticipantDetailsImpl,
      gotoParticipantList: gotoParticipantListImpl,
      gotoNewParticipantView: gotoNewParticipantViewImpl,
      isNewParticipantState: isNewParticipantStateImpl,

      getNumSeatsClass: getNumSeatsClassImpl,

      noTeamPartnerWishAction: noTeamPartnerWishActionImpl,
      newTeamPartnerWishActionWithNewParticipant: newTeamPartnerWishActionWithNewParticipantImpl,
      newTeamPartnerWishActionWithSendInvitation: newTeamPartnerWishActionWithSendInvitationImpl,
      newTeamPartnerWishActionWithTeamPartnerWishUpdated: newTeamPartnerWishActionWithTeamPartnerWishUpdatedImpl
    };


    function getAssignableParticipantsImpl(participants) {
      return _.filter(participants, ['assignmentType', Constants.ASSIGNMENT_TYPE.ASSIGNABLE]) || [];
    }

    function getNotAssignableParticipantsImpl(participants) {
      return _.filter(participants, ['assignmentType', Constants.ASSIGNMENT_TYPE.NOT_ASSIGNABLE]) || [];
    }

    function getParticipantsOrganizedInTeamsImpl(participants) {
      return _.filter(participants, ['assignmentType', Constants.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM]) || [];
    }

    function gotoParticipantDetailsImpl(adminId, participantId, refreshState) {
      var refreshOptions = {};
      if (refreshState === true) {
        refreshOptions = {reload: true, notify: true};
      }
      return $state.go(PARTICIPANT_DETAILS_STATE_NAME, {"adminId": adminId, "participantId": participantId}, refreshOptions);
    }

    function _getParticipantDetailsLink(adminId, participantId) {
      return $state.href(PARTICIPANT_DETAILS_STATE_NAME, {"adminId": adminId, "participantId": participantId});
    }

    function gotoParticipantListImpl(adminId) {
      BaseController.gotoState(PARTICIPANT_LIST_STATE_NAME, adminId);
    }

    function isNewParticipantStateImpl($state) {
      return $state.current.name === NEW_PARTICIPANT_STATE_NAME;
    }

    function gotoNewParticipantViewImpl(adminId) {
      BaseController.gotoState(NEW_PARTICIPANT_STATE_NAME, adminId);
    }

    function saveParticipantAsyncImpl(adminId, participant) {

      var savePromise = null;
      // var successMessage = 'participant_edit_success';
      if (!UtilService.isNewEntity(participant)) {
        savePromise = RestClientService.execute(AdminRequests.updateParticipant, {
          "pathParams": {
            "adminId": adminId,
            "participantId": participant.id
          },
          "data": participant
        });
      } else {
        // successMessage = 'participant_create_success';
        savePromise = RestClientService.execute(AdminRequests.createParticipant, {
          "pathParams": {
            "adminId": adminId
          },
          "data": participant
        });
      }

      return savePromise;
    }

    function showSuccessMessageParticipantSavedImpl(adminId, participant) {
      var fullname = fullnameFilter(participant);
      var showDetailsMesssage = $translate.instant('show_details');
      var successMessage = $translate.instant('participant_save_success', { 'fullname': fullname });
      var detailLink = _getParticipantDetailsLink(adminId, participant.id);
      successMessage += "<br><a style='text-decoration: underline;' href='" + detailLink + "'><strong>" + showDetailsMesssage + "</strong></a>";
      NotificationService.success(successMessage);
    }

    function findParticipantsAsyncImpl(adminId) {
      return RestClientService.execute(AdminRequests.findParticipantsByDinnerAdminId, {
        "pathParams": {
          "adminId": adminId
        }
      }).then(function(response) {
        return response.participants;
      });
    }

    function findNotActivatedParticipantsAsyncImpl(participantIds, adminId) {
      return RestClientService.execute(AdminRequests.findNotActivatedParticipantsByIdsAndAdminId, {
        "pathParams": {
          "adminId": adminId
        },
        "data": {
          adminId: adminId,
          entityIds: participantIds
        }
      }).then(function(response) {
        return response.participants;
      });
    }

    function updateParticipantSubscriptionAsyncImpl(participantId, adminId) {
      return RestClientService.execute(AdminRequests.updateParticipantSubscriptionByIdAndAdminId, {
        "pathParams": {
          "adminId": adminId,
          "participantId": participantId
        }
      });
    }

    function findNotAssignedParticipantsAsyncImpl(dinnerAdminId) {
      return findParticipantsAsyncImpl(dinnerAdminId).then(function(participants) {
        return getNotAssignableParticipantsImpl(participants);
      });
    }

    /**
     * Creates a new empty participant with pre-filled data of the passed running Dinner
     * @param runningDinner
     * @returns {{gender: string, firstnamePart: string, lastname: string, cityName: string, zip: string}}
     */
    function createEmptyParticipantObjectImpl(runningDinner) {
      return {
        gender: Constants.GENDER.MALE,
        firstnamePart: '',
        lastname: '',
        cityName: runningDinner.basicDetails.city,
        zip: runningDinner.basicDetails.zip
      };
    }

    function fillWithExampleDataImpl(participant) {
      if (!participant) {
        return null;
      }
      return angular.extend(participant, exampleParticipant);
    }

    /**
     * Deletes the passed participant for the passed dinner admin id.
     * @param participant
     * @param adminId
     * @returns {*} Returns the deleted participant so that caller can take further actions (e.g. refresh view e.g.)
     */
    function deleteParticipantAsyncImpl(participant, adminId) {
      return RestClientService.execute(AdminRequests.deleteParticipant, {
        "pathParams": {
          "adminId": adminId,
          "participantId": participant.id
        }
      }).then(function() {
        var fullname = fullnameFilter(participant);
        var deletionMessage = $translate.instant('participant_deletion_success_text', { fullname: fullname } );
        NotificationService.success(deletionMessage);
        return participant;
      });
    }

    function findTeamPartnerWishInfoAsyncImpl(participantId, adminId) {

      var statesToIncludeQueryParam = '?relevantState=' + Constants.TEAM_PARTNER_WISH_STATE.NOT_EXISTING + '&relevantState=' + Constants.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH;
      var findTeamPartnerWishInfoRequest = angular.copy(AdminRequests.findTeamPartnerWishInfo);
      findTeamPartnerWishInfoRequest.url += statesToIncludeQueryParam;
      return RestClientService.execute(findTeamPartnerWishInfoRequest, {
        "pathParams": {
          "adminId": adminId,
          "participantId": participantId
        }
      });
    }

    function processParticipantsForViewImpl(participants, numSeatsNeededForHost) {
      for (var i = 0; i < participants.length; i++) {
        _processParticipantForView(participants[i], numSeatsNeededForHost);
      }
      return participants;
    }

    function _processParticipantForView(participant, numSeatsNeededForHost) {
      participant.genderClass = _getGenderClass(participant.gender);
      participant.genderTooltip = _getGenderTooltip(participant.gender);
      participant.numSeatsClass = getNumSeatsClassImpl(participant, numSeatsNeededForHost);
    }

    function _getGenderClass(gender) {
      var result = MasterDataService.getGenderClass(gender);
      result += " fa fa-fw";
      return result;
    }

    function _getGenderName(gender) {
      return MasterDataService.getGenderName(gender);
    }

    function _getGenderTooltip(gender) {
      return _getGenderName(gender);
    }

    function getNumSeatsClassImpl(participant, numSeatsNeededForHost) {
      if (participant.numSeats >= 0) {
        if (participant.numSeats >= numSeatsNeededForHost) {
          return "canhost";
        } else {
          return "nohost";
        }
      }
      return "";
    }


    function noTeamPartnerWishActionImpl(participant) {
      var result = angular.copy(teamPartnerWishActionTemplate);
      result.participant = participant;
      return result;
    }

    function newTeamPartnerWishActionWithNewParticipantImpl(participant, newParticipantToCreate) {
      var result = noTeamPartnerWishActionImpl(participant);
      result.newParticipantToCreate = newParticipantToCreate;
      return result;
    }

    function newTeamPartnerWishActionWithSendInvitationImpl(participant, sentInvitationEmail) {
      var result = noTeamPartnerWishActionImpl(participant);
      result.sentInvitationEmail = sentInvitationEmail;
      return result;
    }

    function newTeamPartnerWishActionWithTeamPartnerWishUpdatedImpl(participant, participantWithTeamPartnerWishUpdated) {

      var result = noTeamPartnerWishActionImpl(participant);
      result.participantWithTeamPartnerWishUpdated = participantWithTeamPartnerWishUpdated;
      return result;
    }

  }

})(angular);
