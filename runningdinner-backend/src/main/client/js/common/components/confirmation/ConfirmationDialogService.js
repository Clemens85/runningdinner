(function(angular) {
  'use strict';

  angular.module('rd.common.components').service('ConfirmationDialogService', ConfirmationDialogService);

  function ConfirmationDialogService($uibModal) {

    return {
      openConfirmationDialog: openConfirmationDialogImpl
    };

    /**
     *
     * @param title
     * @param text
     * @param buttons  E.g. [{ label: 'cancel', class: "btn-link"}, { label: 'Absagen', class: "btn-success", confirm: true }]
     * @returns {*}
     */
    function openConfirmationDialogImpl(title, text, buttons) {

      var dialogButtons = buttons;
      if (!dialogButtons) {
        dialogButtons = [
          { label: 'cancel' },
          { confirm: true, label: 'Ok' }
        ];
      }

      var modalInstance = $uibModal.open({
        templateUrl: 'common/components/confirmation/confirmation-dialog.html?v=@@buildno@@',
        controller: 'ConfirmationDialogCtrl',
        controllerAs: 'ctrl',
        resolve: {
          title: function() {
            return title;
          },
          text: function() {
            return text;
          },
          buttons: function() {
            return dialogButtons;
          }
        }
      });

      var modalPromise = modalInstance.result;
      return modalPromise;
    }
  }

})(angular);
