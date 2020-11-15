(function(angular) {
  'use strict';

  angular.module('rd.admin.components').factory('BasicDetailsUpdatePreviewService', BasicDetailsUpdatePreviewService);

  function BasicDetailsUpdatePreviewService(RunningDinnerService, ParticipantService, $q, $uibModal) {

    return {
      showBasicDetailsUpdatePreviewAsync: showBasicDetailsUpdatePreviewAsyncImpl
    };

    function showBasicDetailsUpdatePreviewAsyncImpl(dinnerPristine, dinnerDirty) {

      var findParticipantsPromise;
      var changeInDate = RunningDinnerService.isChangeInDate(dinnerPristine, dinnerDirty);
      if (changeInDate) {
        findParticipantsPromise = ParticipantService.findParticipantsAsync(dinnerDirty.adminId);
      }
      var relevantRegistrationTypeChange = RunningDinnerService.isChangedFromClosedToPublicOrOpen(dinnerPristine, dinnerDirty) ||
                                           RunningDinnerService.isChangedFromPublicOrOpenToClosed(dinnerPristine, dinnerDirty);

      if (changeInDate || relevantRegistrationTypeChange) {
        var result = $q.defer();
        if (findParticipantsPromise) {
          findParticipantsPromise.then(function(participants) {
            _showBasicDetailsChangeDialogAsync(dinnerPristine, dinnerDirty, participants, result);
          });
        } else {
          _showBasicDetailsChangeDialogAsync(dinnerPristine, dinnerDirty, [], result);
        }
        return result.promise;
      }

      // else:
      return $q.resolve(false);
    }

    function _showBasicDetailsChangeDialogAsync(dinnerPristine, dinnerDirty, participants, deferredPromiseResult) {

      var modalInstance = $uibModal.open({
        templateUrl: 'admin/settings/components/basicdetailspreviewdialog.html?v=@@buildno@@',
        controller: 'BasicDetailsUpdatePreviewModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          dinnerPristine: function() {
            return dinnerPristine;
          },
          dinnerDirty: function() {
            return dinnerDirty;
          },
          participants: function() {
            return participants;
          }
        }
      });

      return modalInstance.result.then(function(shouldNotifyParticipants) {
        deferredPromiseResult.resolve(shouldNotifyParticipants);
      }, function() {
        deferredPromiseResult.reject();
      });
    }
  }

  angular.module('rd.admin.components').controller('BasicDetailsUpdatePreviewModalCtrl', BasicDetailsUpdatePreviewModalCtrl);
  function BasicDetailsUpdatePreviewModalCtrl(RunningDinnerService, $uibModalInstance, dinnerPristine, dinnerDirty, participants) {

    var vm = this;
    vm.dinnerDirty = dinnerDirty;

    vm.save = saveImpl;
    vm.next = nextImpl;
    vm.cancel = cancelImpl;

    _activate();

    function _activate() {
      vm.changeInDateWithExistingParticipants = RunningDinnerService.isChangeInDate(dinnerPristine, dinnerDirty) && participants && participants.length > 0;
      vm.shouldNotifyParticipants = vm.changeInDateWithExistingParticipants;
      vm.changedFromClosedToPublicOrOpen = RunningDinnerService.isChangedFromClosedToPublicOrOpen(dinnerPristine, dinnerDirty);
      vm.changedFromPublicOrOpenToClosed = RunningDinnerService.isChangedFromPublicOrOpenToClosed(dinnerPristine, dinnerDirty);
      _showOrHideNextButton();
    }

    function cancelImpl() {
      $uibModalInstance.dismiss('cancel');
    }

    function saveImpl() {
      $uibModalInstance.close(vm.shouldNotifyParticipants);
    }

    function nextImpl() {
      vm.changeInDateWithExistingParticipants = false;
      _showOrHideNextButton();
    }

    function _showOrHideNextButton() {
      vm.showNextButton = vm.changeInDateWithExistingParticipants && (vm.changedFromClosedToPublicOrOpen || vm.changedFromPublicOrOpenToClosed);
      return vm.showNextButton;
    }
  }

}(angular));
