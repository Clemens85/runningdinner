(function(angular) {
  'use strict';

  angular.module('rd.common.components').factory('CustomSelectionService', CustomSelectionService);

  function CustomSelectionService($uibModal) {

    return {
      openCustomEntitySelectionDialogAsync: openCustomEntitySelectionDialogAsyncImpl
    };

    function openCustomEntitySelectionDialogAsyncImpl(allEntities, alreadySelectedEntities, displayFilter) {
      var modalInstance = $uibModal.open({
        templateUrl: 'common/components/customselection/customselectiondialog.html?v=@@buildno@@',
        controller: 'CustomSelectionServiceModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          allEntities: function() {
            return angular.copy(allEntities);
          },
          alreadySelectedEntities: function() {
            return alreadySelectedEntities;
          },
          displayFilter: function() {
            return displayFilter;
          }
        }
      });
      return modalInstance.result;
    }
  }


  angular.module('rd.common.components').controller('CustomSelectionServiceModalCtrl', CustomSelectionServiceModalCtrl);
  function CustomSelectionServiceModalCtrl($uibModalInstance, UtilService, _, allEntities, alreadySelectedEntities, displayFilter) {

    var vm = this;

    vm.cancel = cancel;
    vm.save = save;

    vm.getLabel = getLabel;

    _activate();

    function _activate() {

      _applyAlreadySelectedEntities();

      var numEntities = allEntities.length;
      var halfNumEntities = numEntities / 2;
      var remainder = numEntities % 2;

      vm.entitiesLeftCol = allEntities.slice(0, halfNumEntities + remainder);
      vm.entitiesRightCol = allEntities.slice(halfNumEntities + remainder);
    }

    function save() {
      var selectedEntities = _getSelectedEntities(vm.entitiesLeftCol);
      selectedEntities = _.concat(selectedEntities, _getSelectedEntities(vm.entitiesRightCol));
      $uibModalInstance.close(selectedEntities);
      return selectedEntities;
    }

    function cancel() {
      $uibModalInstance.close(alreadySelectedEntities);
    }

    function getLabel(entity) {
      return displayFilter(entity);
    }

    function _applyAlreadySelectedEntities() {
      for (var i = 0; i < alreadySelectedEntities.length; i++) {
        var foundEntity = UtilService.findEntityById(allEntities, alreadySelectedEntities[i].id);
        if (foundEntity) {
          foundEntity.selected = true;
        }
      }
    }

    function _getSelectedEntities(entities) {
      return _.filter(entities, ['selected', true]);
    }
  }

})(angular);
