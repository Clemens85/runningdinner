(function(angular) {
  'use strict';

  angular.module('rd.admin.services').factory('RunningDinnerService', RunningDinnerService);

  function RunningDinnerService(RestClientService, Constants, AdminRequests, DateService) {

    var runningDinnerPromise;

    return {
      findRunningDinnerByAdminIdAsync: findRunningDinnerByAdminIdAsyncImpl,

      isClosedDinner: isClosedDinnerImpl,
      isPublicVisibleDinner: isPublicVisibleDinnerImpl,

      getNumSeatsNeededForHost: getNumSeatsNeededForHostImpl,
      getMinimumParticipantsNeeded: getMinimumParticipantsNeededImpl,

      updateBasicSettingsAsync: updateBasicSettingsAsyncImpl,
      updatePublicSettingsAsync: updatePublicSettingsAsyncImpl,
      updateRegistrationActiveStateAsync: updateRegistrationActiveStateAsyncImpl,
      updateTeamPartnerWishDisabledAsync: updateTeamPartnerWishDisabledAsyncImpl,
      updateMealTimes: updateMealTimesImpl,

      cancelRunningDinnerAsync: cancelRunningDinnerAsyncImpl,
      acknowledgeRunningDinnerAsync: acknowledgeRunningDinnerAsyncImpl,

      isChangeInDate: isChangeInDateImpl,
      isChangedFromClosedToPublicOrOpen: isChangedFromClosedToPublicOrOpenImpl,
      isChangedFromPublicOrOpenToClosed: isChangedFromPublicOrOpenToClosedImpl
    };


    function findRunningDinnerByAdminIdAsyncImpl(adminId) {

      if (!runningDinnerPromise) {
        runningDinnerPromise = RestClientService.execute(AdminRequests.findRunningDinnerByAdminId, {
          "pathParams": {
            "adminId": adminId
          }
        });
      }

      return runningDinnerPromise;
    }

    function isClosedDinnerImpl(dinner) {
      var registrationType = dinner.basicDetails.registrationType;

      if (registrationType === Constants.REGISTRATION_TYPE.CLOSED) {
        return true;
      }
      return false;
    }

    function isPublicVisibleDinnerImpl(dinner) {
      var registrationType = dinner.basicDetails.registrationType;

      if (registrationType === Constants.REGISTRATION_TYPE.PUBLIC) {
        return true;
      }
      return false;
    }

    function getNumSeatsNeededForHostImpl(runningDinner) {
      var teamSize = runningDinner.options.teamSize;
      var numMeals = runningDinner.options.meals.length;
      return teamSize * numMeals;
    }

    function getMinimumParticipantsNeededImpl(runningDinner) {

      var numMeals = runningDinner.options.meals.length;
      var teamSize = runningDinner.options.teamSize;
      return numMeals * numMeals * teamSize;
    }

    function updateMealTimesImpl(adminId, meals) {
      return RestClientService.execute(AdminRequests.updateMealTimes, {
        "pathParams": {
          "adminId": adminId
        },
        "data" : {
          "meals": meals
        }
      });
    }

    function updateBasicSettingsAsyncImpl(adminId, runningDinner) {
      var basicSettings = {
        basicDetails: runningDinner.basicDetails,
        teamPartnerWishDisabled: runningDinner.options.teamPartnerWishDisabled
      };

      return RestClientService.execute(AdminRequests.updateBasicSettings, {
        "pathParams": {
          "adminId": adminId
        },
        "data" : basicSettings
      }).then(function(response) {
        runningDinnerPromise = null; // Force reload of running dinner in new request
        return response;
      });
    }

    function updatePublicSettingsAsyncImpl(adminId, publicSettings) {
      return RestClientService.execute(AdminRequests.updatePublicSettings, {
        "pathParams": {
          "adminId": adminId
        },
        "data" : publicSettings
      }).then(function(response) {
        runningDinnerPromise = null; // Force reload of running dinner in new request
        return response;
      });
    }

    function updateRegistrationActiveStateAsyncImpl(adminId, enable) {
      return RestClientService.execute(AdminRequests.updateRegistrationActiveState, {
        "pathParams": {
          "adminId": adminId,
          "enable": enable
        }
      }).then(function(response) {
        runningDinnerPromise = null; // Force reload of running dinner in new request
        return response;
      });
    }

    function updateTeamPartnerWishDisabledAsyncImpl(adminId, teamPartnerWishDisabled) {
      return RestClientService.execute(AdminRequests.updateTeamPartnerWishDisabled, {
        "pathParams": {
          "adminId": adminId,
          "teamPartnerWishDisabled": teamPartnerWishDisabled
        }
      }).then(function(response) {
        runningDinnerPromise = null; // Force reload of running dinner in new request
        return response;
      });
    }

    function cancelRunningDinnerAsyncImpl(adminId) {
      return RestClientService.execute(AdminRequests.cancelRunningDinner, {
        "pathParams": {
          "adminId": adminId
        }
      }).then(function() {
        runningDinnerPromise = null; // Force reload of running dinner in new request
      });
    }

    function acknowledgeRunningDinnerAsyncImpl(adminId, acknowledgeId) {
      return RestClientService.execute(AdminRequests.acknowledgeRunningDinner, {
        "pathParams": {
          "adminId": adminId,
          "acknowledgeId": acknowledgeId
        }
      }).then(function() {
        runningDinnerPromise = null; // Force reload of running dinner in new request
      });
    }

    function isChangeInDateImpl(dinnerPristine, dinnerDirty) {
      if (dinnerPristine.basicDetails.date && dinnerDirty.basicDetails.date) {
        return DateService.getDaysBetweenDates(dinnerPristine.basicDetails.date, dinnerDirty.basicDetails.date) !== 0;
      }
      return false;
    }

    function isChangedFromClosedToPublicOrOpenImpl(dinnerPristine, dinnerDirty) {
      return isClosedDinnerImpl(dinnerPristine) && !isClosedDinnerImpl(dinnerDirty);
    }

    function isChangedFromPublicOrOpenToClosedImpl(dinnerPristine, dinnerDirty) {
      return !isClosedDinnerImpl(dinnerPristine) && isClosedDinnerImpl(dinnerDirty);
    }

  }

}(angular));
