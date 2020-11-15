(function(angular) {
  'use strict';

  angular.module('SelfAdminApp',
      [
        'rd.common',
        'rd.self.constants',
        'rd.self.services',
        'rd.self.components'
      ])
      .config(configSelfAdminModule);


  function configSelfAdminModule($stateProvider, $urlRouterProvider, $translateProvider, SelfAdminMessages_lang_de, SelfAdminMessages_lang_en) {

    $stateProvider

      .state('self', {
        abstract: true,
        templateUrl: 'self/layouts/layout-selfadmin-container.html?v=@@buildno@@',
        url: '/:selfAdministrationId',
        controller: 'SelfAdminMainCtrl as ctrl'
      })

      .state('self.teamhost', {
        url: '/teamhost/:participantId/:teamId',
        views: {
          "main-content": {
            controller: 'ChangeTeamHostCtrl as ctrl',
            templateUrl: 'self/views/changeteamhost.html?v=@@buildno@@'
          }
        },
        data: {
          browserTitle : 'host_manage_title'
        }
      })

      .state('self.teampartnerwish', {
        url: '/teampartnerwish/:participantId/?email',
        views: {
          "main-content": {
            component: 'manageTeamPartnerWish'
          }
        },
        resolve: {
          parameters: function ($stateParams) {
            return {
              selfAdministrationId: $stateParams.selfAdministrationId,
              email: $stateParams.email,
              participantId: $stateParams.participantId
            };
          }
        },
        data: {
          browserTitle : 'team_partner_wish_manage_title'
        }
      })

      .state('self.dinnerroute', {
        url: '/dinnerroute/:participantId/:teamId',
        views: {
          "main-content": {
            controller: 'DinnerRouteUserViewCtrl as ctrl',
            templateUrl: 'self/views/dinnerrouteuserview.html?v=@@buildno@@'
          }
        },
        data: {
          browserTitle : 'Run Your Dinner - Dinner Route'
        }
      });


    $translateProvider.preferredLanguage('de');
    $translateProvider.translations('de', SelfAdminMessages_lang_de);
    $translateProvider.translations('en', SelfAdminMessages_lang_en);
    // Add ngSanitize as dependency!
    // $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
  }

})(angular);
