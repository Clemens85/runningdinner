(function(angular) {
  'use strict';

  angular.module('rd.frontend.components').service('RegistrationSummaryViewService', RegistrationSummaryViewService);

  function RegistrationSummaryViewService($uibModal) {

    return {
      openRegistrationSummaryDialog: openRegistrationSummaryDialog
    };

    function openRegistrationSummaryDialog(publicDinnerId, registrationData, registrationSummary,
                                          onRegistrationSuccessCallback, onRegistrationFailedCallback) {

      var modalInstance = $uibModal.open({
        templateUrl: 'frontend/components/registrationsummarydialog.html?v=@@buildno@@',
        controller: 'RegistrationSummaryModalCtrl',
        controllerAs: 'vm',
        resolve: {
          publicDinnerId: function() {
            return publicDinnerId;
          },
          registrationSummary: function () {
            return registrationSummary;
          },
          registrationData: function() {
            return registrationData;
          }
        }
      });

      modalInstance.result.then(function (result) {
        onRegistrationSuccessCallback(result);
      }, function (dismissResult) {
        // User hit cancel or error happened, just callback if an error happened:
        if (dismissResult !== 'cancel') {
          onRegistrationFailedCallback(dismissResult);
        }
      });
    }
  }


  angular.module('rd.frontend.components').controller('RegistrationSummaryModalCtrl', RegistrationSummaryModalCtrl);
  function RegistrationSummaryModalCtrl($uibModalInstance, $translate, MasterDataService, PublicDinnerEventService,
                                        publicDinnerId, registrationData, registrationSummary) {

    var vm = this;
    vm.registrationSummary = registrationSummary;
    vm.registrationData = registrationData;
    vm.publicDinnerId = publicDinnerId;

    vm.performRegistration = performRegistration;
    vm.cancel = cancel;
    vm.getGenderName = getGenderName;
    vm.getMealSpecificsAsString = getMealSpecificsAsString;

    vm.registrationSummary.showNotEnoughSeatsMessage = !vm.registrationSummary.teamPartnerWish && vm.registrationSummary.canHost === false;

    function getGenderName(gender) {
      return MasterDataService.getGenderName(gender);
    }

    function getMealSpecificsAsString(mealSpecifics) {
      var result = '';

      if (!mealSpecifics) {
        return result;
      }

      if (mealSpecifics.vegetarian === true) {
        result += $translate.instant('vegetarian') + ', ';
      }
      if (mealSpecifics.vegan === true) {
        result += $translate.instant('vegan') + ', ';
      }
      if (mealSpecifics.lactose === true) {
        result += $translate.instant('lactose') + ', ';
      }
      if (mealSpecifics.gluten === true) {
        result += $translate.instant('gluten') + ', ';
      }

      if (result.length > 0) {
        result = result.trim().slice(0, -1);
      }
      return result;
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function performRegistration() {
      return PublicDinnerEventService.performRegistration(vm.publicDinnerId, vm.registrationData).then(function(response) {
        $uibModalInstance.close(response);
      }, function(errorResponse) {
        $uibModalInstance.dismiss(errorResponse);
      });
    }
  }

})(angular);
