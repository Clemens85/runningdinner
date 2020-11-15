(function(angular) {
  'use strict';


  angular.module('FrontendApp',
      [
        'rd.common',
        'rd.frontend.constants',
        'rd.frontend.services',
        'rd.frontend.components'
      ])
      .config(configFrontendModule);


  function configFrontendModule($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider,
                                FrontendMessages_lang_de, FrontendMessages_lang_en, NewsMessages_lang_de, NewsMessages_lang_en) {

    // Get better links:
    $locationProvider.html5Mode(true);

    $urlRouterProvider.when('/', '/running-dinner-veranstalten-teilnehmen/');
    $urlRouterProvider.when('', '/running-dinner-veranstalten-teilnehmen/');
    $urlRouterProvider.when('/running-dinner-veranstalten-teilnehmen', '/running-dinner-veranstalten-teilnehmen/');
    $urlRouterProvider.when('/running-dinner-events', '/running-dinner-events/');
    $urlRouterProvider.when('/running-dinner-event/:publicDinnerId/', '/running-dinner-event/:publicDinnerId');
    $urlRouterProvider.when('/running-dinner-event/:publicDinnerId/registration', '/running-dinner-event/:publicDinnerId/registration/');
    $urlRouterProvider.when('/running-dinner-event/:publicDinnerId/registrationfinished', '/running-dinner-event/:publicDinnerId/registrationfinished/');
    $urlRouterProvider.when('/running-dinner-event/:publicDinnerId/:participantId/activate', '/running-dinner-event/:publicDinnerId/:participantId/activate/');
    $urlRouterProvider.when('/create-running-dinner', '/create-running-dinner/');
    $urlRouterProvider.when('/news', '/news/');
    $urlRouterProvider.when('/impressum', '/impressum/');
    $urlRouterProvider.when('/error', '/error/');

    $stateProvider

        .state('frontend', {
          abstract: true,
          templateUrl: 'frontend/layouts/layout-frontend-container.html?v=@@buildno@@',
          controller: 'FrontendMainCtrl as rootVm',
          url: ''
        })

        .state('frontend.start', {
          url: '/running-dinner-veranstalten-teilnehmen/',
          views: {
            "teaser-content": {
              templateUrl: 'frontend/views/teaser.html?v=@@buildno@@'
            },
            "main-content": {
              templateUrl: 'frontend/views/start.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'start_title'
          }
        })

        .state('frontend.events', {
          url: '/running-dinner-events/',
          views: {
            "main-content": {
              controller: 'PublicDinnerEventListCtrl as vm',
              templateUrl: 'frontend/views/dinnereventlist.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'public_dinner_events_headline'
          }
        })

        .state('frontend.eventdetails', {
          url: '/running-dinner-event/:publicDinnerId?participantSubscribed',
          views: {
            "main-content": {
              controller: 'PublicDinnerEventDetailsCtrl as vm',
              templateUrl: 'frontend/views/dinnereventdetails.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'public_dinner_events_headline'
          }
        })
        .state('frontend.eventdetails.registration', {
          url: '/registration/?invitingParticipantEmail&prefilledEmailAddress',
          views: {
            "registration-form@frontend.eventdetails": {
              controller: 'PublicDinnerEventRegistrationCtrl as vm',
              templateUrl: 'frontend/views/dinnereventdetails-registration.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'registration'
          }
        })
        .state('frontend.registrationfinished', {
          url: '/running-dinner-event/:publicDinnerId/registrationfinished/',
          views: {
            "main-content": {
              controller: 'RegistrationFinishedCtrl as ctrl',
              templateUrl: 'frontend/views/registrationfinished.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'registration_finished_title'
          }
        })

        .state('frontend.activate', {
          url: '/running-dinner-event/:publicDinnerId/:participantId/activate/',
          views: {
            "main-content": {
              controller: 'RegistrationActivationCtrl as ctrl',
              templateUrl: 'frontend/views/registrationactivation.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'registration_confirm_title'
          }
        })

        .state('frontend.create', {
          url: '/create-running-dinner/',
          views: {
            "main-content": {
              templateUrl: 'frontend/views/create.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'create_wizard_title'
          }
        })

        .state('frontend.news', {
          url: '/news/',
          views: {
            "main-content": {
              controller: 'NewsCtrl as ctrl',
              templateUrl: 'frontend/views/news.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'news'
          }
        })

        .state('frontend.impressum', {
          url: '/impressum/',
          views: {
            "main-content": {
              templateUrl: 'frontend/views/impressum.html?v=@@buildno@@'
            }
          },
          data: {
            browserTitle : 'impressum_title'
          }
        })

        .state('error', {
          url: '/error/',
          template: 'Error!!!'
        });


    var translationsDe = angular.extend({}, FrontendMessages_lang_de, NewsMessages_lang_de);
    var translationsEn = angular.extend({}, FrontendMessages_lang_en, NewsMessages_lang_en);
    $translateProvider.translations('de', translationsDe);
    $translateProvider.translations('en', translationsEn);

    // Add ngSanitize as dependency!
    // $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
  }

})(angular);
