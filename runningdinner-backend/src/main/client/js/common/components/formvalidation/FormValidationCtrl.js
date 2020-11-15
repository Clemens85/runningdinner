(function(angular) {
  'use strict';

  angular
      .module('rd.common.components')
      .controller('FormValidationCtrl', FormValidationCtrl);

  function FormValidationCtrl() {

    var vm = this;
    vm.name = null;
    vm.prefixToRemove = null;

    vm.setName = setNameImpl;
    vm.getName = getNameImpl;
    vm.setPrefixToRemove = setPrefixToRemoveImpl;
    vm.getPrefixToRemove = getPrefixToRemoveImpl;

    function setNameImpl(name) {
      vm.name = name;
    }

    function setPrefixToRemoveImpl(prefixToRemove) {
      vm.prefixToRemove = prefixToRemove;
    }

    function getNameImpl() {
      return vm.name;
    }

    function getPrefixToRemoveImpl() {
      return vm.prefixToRemove;
    }
  }

})(angular);
