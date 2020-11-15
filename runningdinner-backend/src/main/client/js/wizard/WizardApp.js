(function(angular) {
  'use strict';

    angular.module('WizardApp',
        [
          'rd.common',
          'rd.admin.services',
          'rd.wizard.constants',
          'rd.wizard.services'
        ])
        .config(configWizardModule);


    function configWizardModule($stateProvider, $urlRouterProvider, $translateProvider, WizardNavigationStates, WizardMessages_lang_de, WizardMessages_lang_en) {
        $urlRouterProvider.when('/running-dinner-wizard/', '/running-dinner-wizard');
        $urlRouterProvider.when('/running-dinner-wizard/options', '/running-dinner-wizard/options/');
        $urlRouterProvider.when('/running-dinner-wizard/mealtimes', '/running-dinner-wizard/mealtimes/');
        $urlRouterProvider.when('/running-dinner-wizard/participants-preview', '/running-dinner-wizard/participants-preview/');
        $urlRouterProvider.when('/running-dinner-wizard/registration-settings', '/running-dinner-wizard/registration-settings/');
        $urlRouterProvider.when('/running-dinner-wizard/finish', '/running-dinner-wizard/finish/');
        $urlRouterProvider.when('/running-dinner-wizard/summary', '/running-dinner-wizard/summary/');
        $urlRouterProvider.otherwise('/running-dinner-wizard');

        $stateProvider
          .state('wizard', {
            abstract: true,
            url: '/running-dinner-wizard?demoDinner',
            controller : 'CreateDinnerWizardCtrl as ctrl',
            templateUrl: 'wizard/layouts/layout-wizard-container.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.BASIC_STATE.name, {
            url: '',
            templateUrl: 'wizard/views/basic-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.OPTION_STATE.name, {
            url: '/options/',
            templateUrl: 'wizard/views/options-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.MEALTIMES_STATE.name, {
            url: '/mealtimes/',
            templateUrl: 'wizard/views/mealtimes-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.PARTICIPANTS_PREVIEW_STATE.name, {
            url: '/participants-preview/',
            templateUrl: 'wizard/views/participants-preview-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.REGISTRATION_SETTINGS_STATE.name, {
            url: '/registration-settings/',
            templateUrl: 'wizard/views/registration-settings-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.FINISH_STATE.name, {
            url: '/finish/',
            templateUrl: 'wizard/views/finish-step.html?v=@@buildno@@'
          })
          .state(WizardNavigationStates.SUMMARY_STATE.name, {
            url: '/summary/',
            templateUrl: 'wizard/views/summary.html?v=@@buildno@@'
          });

        $translateProvider.translations('de', WizardMessages_lang_de);
        $translateProvider.translations('en', WizardMessages_lang_en);
    }

})(angular);
