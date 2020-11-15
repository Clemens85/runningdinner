(function(angular) {
  'use strict';

  angular.module('rd.common.components').controller('ConfirmationDialogCtrl', ConfirmationDialogCtrl);

  function ConfirmationDialogCtrl($uibModalInstance, $translate, title, text, buttons) {

    var vm = this;
    vm.title = title;
    vm.text = text;
    vm.buttons = buttons;

    vm.getClass = getClass;
    vm.clickAction = clickAction;
    vm.getLabel = getLabel;

    vm.dismiss = dismiss;


    function getClass(button) {
      if (button.class && button.class.length > 0) {
        return button.class;
      }
      if (button.confirm === true) {
        return "btn-success";
      } else {
        return "btn-default";
      }
    }

    function clickAction(button) {
      if (button.confirm !== true) {
        dismiss();
      } else {
        $uibModalInstance.close('ok');
      }
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }


    function getLabel(button) {
      if (button.label && button.label.length > 0) {
        return $translate.instant(button.label);
      }
    }
  }

})(angular);
