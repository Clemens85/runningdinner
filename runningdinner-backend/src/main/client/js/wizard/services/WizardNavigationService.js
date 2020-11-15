(function(angular) {
  'use strict';

  angular
      .module('rd.wizard.services')
      .factory('WizardNavigationService', WizardNavigationService);

  function WizardNavigationService(CreateWizardService, WizardNavigationStates, $state, BaseController, _) {

    return {
      navigate: navigateImpl,
      getAllStates: getAllStatesImpl,
      isStepReached: isStepReachedImpl,
      getVisibleStates: getVisibleStatesImpl
    };


    function navigateImpl(dinnerModel, next) {
      var currentWizardState = _getCurrentWizardState();
      var nextWizardStateName = currentWizardState.getNextStateName(CreateWizardService.isClosedDinner(dinnerModel), next);
      var nextWizardState = _getWizardStateByPropertyName(nextWizardStateName);
      BaseController.gotoState(nextWizardState.name);
    }

    function getAllStatesImpl(filterForPropertyName) {
      var wizardStatePropertyNames = Object.keys(WizardNavigationStates);
      var result = [];
      for (var i = 0; i < wizardStatePropertyNames.length; i++) {
        var wizardStatePropertyName = wizardStatePropertyNames[i];
        if (filterForPropertyName && filterForPropertyName.length > 0 && filterForPropertyName !== wizardStatePropertyName) {
          continue;
        }
        var wizardState = WizardNavigationStates[wizardStatePropertyName];
        result.push(wizardState);
      }
      return result;
    }

    function getVisibleStatesImpl(dinnerModel) {
      var closedDinner = CreateWizardService.isClosedDinner(dinnerModel);
      var allStates = getAllStatesImpl();
      return _.filter(allStates, function(state) { return state.isVisible(closedDinner); });
    }

    function isStepReachedImpl(stepNumber) {
      var currentStateName = $state.current.name;
      var allStates = getAllStatesImpl();

      for (var i = 0; i < allStates.length; i++) {
        if (allStates[i].name !== currentStateName) {
          continue;
        }
        return stepNumber <= allStates[i].number;
      }
      return false;
    }

    function _getCurrentWizardState() {
      var currentStateName = $state.current.name;
      var allStates = getAllStatesImpl();
      for (var i = 0; i < allStates.length; i++) {
        if (allStates[i].name !== currentStateName) {
          continue;
        }
        return allStates[i];
      }
    }

    function _getWizardStateByPropertyName(propertyName) {
      var result = getAllStatesImpl(propertyName);
      if (result.length === 1) {
        return result[0];
      }
      return null;
    }

  }

})(angular);
