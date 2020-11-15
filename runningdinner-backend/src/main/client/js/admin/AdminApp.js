(function(angular) {
  'use strict';

  angular.module('AdminApp',
      [
        'rd.common',
        'rd.admin.components',
        'rd.admin.constants',
        'rd.admin.services'
      ])
      .config(configAdminModule);


  function configAdminModule($stateProvider, $urlRouterProvider, $translateProvider, Constants, AdminMessages_lang_de, AdminMessages_lang_en) {
    $urlRouterProvider.when('/:adminId', '/:adminId/dashboard/');
    $urlRouterProvider.when('/:adminId/dashboard', '/:adminId/dashboard/');
    $urlRouterProvider.when('/:adminId/teams', '/:adminId/teams/');
    $urlRouterProvider.when('/:adminId/participants', '/:adminId/participants/');
    $urlRouterProvider.when('/:adminId/settings', '/:adminId/settings/');
    // $urlRouterProvider.when('/:adminId/mails/teams/arrangements', '/:adminId/mails/teams/arrangements/');
    $urlRouterProvider.when('/:adminId/mails/teams/dinnerroutes', '/:adminId/mails/teams/dinnerroutes/');
    $urlRouterProvider.when('/:adminId/mailprotocols', '/:adminId/mailprotocols/');
    $urlRouterProvider.when('/:adminId/:acknowledgeId/acknowledge', '/:adminId/:acknowledgeId/acknowledge/');
    $urlRouterProvider.when('/error', '/error/');

    $stateProvider

        .state('admin', {
          abstract: true,
          templateUrl: 'admin/common/layouts/layout-admin-container.html?v=@@buildno@@',
          controller: 'AdminMainMenuCtrl as ctrl',
          url: '/:adminId',
          resolve: {
            adminId: ['$stateParams', function($stateParams) {
              return $stateParams.adminId;
            }]
          }
        })

        .state('admin.dashboard', {
          url: '/dashboard/',
          views: {
            "main-content": {
              controller: 'DashboardCtrl as ctrl',
              templateUrl: 'admin/dashboard/views/dashboard.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'Dashboard - Running Dinner Administration'
          }
        })

        .state('admin.participants', {
          url: '/participants/',
          views: {
            "main-content": {
              controller: 'ParticipantCtrl as ctrl',
              templateUrl: 'admin/participants/views/participants.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'participants'
          }
        })
        .state('admin.participants.details', {
          url: 'details/:participantId'
        })
        .state('admin.participants.new', {
          url: 'new'
        })

        .state('admin.teams', {
          url: '/teams/',
          views: {
            "main-content": {
              controller: 'TeamCtrl as ctrl',
              templateUrl: 'admin/teams/views/teams.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'Teams'
          }
        })
        .state('admin.teams.details', {
          url: ':teamId?teamMemberIdToCancel'
        })

        .state('admin.dinnerroute', {
          url: '/dinnerroute/:teamId',
          views: {
            "main-content": {
              controller: 'DinnerRouteAdminCtrl as ctrl',
              templateUrl: 'admin/teams/views/dinnerrouteadmin.html?v=@@buildno@@'
            }
          },
          resolve: {
            teamId: ['$stateParams', function($stateParams) {
              return $stateParams.teamId;
            }]
          },
          data: {
            browserTitle : 'Dinner Route'
          }
        })

        .state('admin.mails-participants', {
          url: '/mails/participants/?selectAllParticipants',
          views: {
            "main-content": {
              controller: 'MessageParticipantCtrl as ctrl',
              templateUrl: 'admin/messaging/views/messageparticipant.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle: 'mails_send_participants_title'
          }
        })

        .state('admin.mails-teams', {
          abstract: true,
          url: '/mails/teams',
          views: {
            "main-content": {
              controller: 'MessageTeamCtrl as ctrl',
              templateUrl: 'admin/messaging/views/messageteam.html?v=@@buildno@@'
            }
          }
        })
        .state('admin.mails-teams.arrangements', {
          url: '/arrangements?selectedTeamIds&headline',
          data: {
            messageType: Constants.MESSAGE_TYPE.TEAM,
            browserTitle: 'mails_send_teams_title'
          }
        })
        .state('admin.mails-teams.dinnerroutes', {
          url: '/dinnerroutes/',
          data: {
            messageType: Constants.MESSAGE_TYPE.DINNER_ROUTE,
            browserTitle: 'mails_send_dinnerroutes_title'
          }
        })

        .state('admin.messagejobs', {
          url: '/mailprotocols/',
          views: {
            "main-content": {
              controller: 'MessageJobCtrl as ctrl',
              templateUrl: 'admin/messaging/views/messagejob.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'mail_protocols'
          }
        })
        .state('admin.messagejobs.details', {
          url: ':messageJobId'
        })

        .state('admin.acknowledge', {
          url: '/:acknowledgeId/acknowledge/',
          views: {
            "main-content": {
              controller: 'AcknowledgeCtrl as ctrl',
              templateUrl: 'admin/acknowledge/views/acknowledge.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'confirmation_title'
          }
        })

        .state('admin.settings', {
          url: '/settings/',
          views: {
            "main-content": {
              controller: 'SettingsCtrl as ctrl',
              templateUrl: 'admin/settings/views/settings.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'settings'
          }
        })

        .state('error', {
          url: '/error/',
          template: 'Dinner event not found!!'
        });


    $translateProvider.preferredLanguage('de');
    $translateProvider.translations('de', AdminMessages_lang_de);
    $translateProvider.translations('en', AdminMessages_lang_en);
  }

})(angular);
