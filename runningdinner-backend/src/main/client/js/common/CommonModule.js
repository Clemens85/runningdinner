(function(angular) {
  'use strict';

  angular.module('rd.common', [
    'ui.router',
    'toastr',
    'ui.bootstrap',
    'angularFileUpload',
    'ngSanitize',
    'ui.select',
    //'ui.date',
    'ngDragDrop',
    'angularPromiseButtons',
    'ngMap',
    'tmh.dynamicLocale',
    'ngCookies',

    'rd.common.components',
    'rd.common.constants',
    'rd.common.services',
    'rd.common.filters'
  ]).config(configCommon).run(runCommon);


  function configCommon($httpProvider, $translateProvider, uibButtonConfig, uiSelectConfig, toastrConfig, $qProvider,
                        tmhDynamicLocaleProvider, CommonMessages_lang_de, CommonMessages_lang_en) {
    $httpProvider.interceptors.push('HttpInterceptor');

    $translateProvider.preferredLanguage('de');
    $translateProvider.translations('de', CommonMessages_lang_de);
    $translateProvider.translations('en', CommonMessages_lang_en);
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useCookieStorage();

    tmhDynamicLocaleProvider.localeLocationPattern('/resources/angular-locale_{{locale}}.js');
    tmhDynamicLocaleProvider.defaultLocale('de');

    uiSelectConfig.theme = 'bootstrap';
    uibButtonConfig.activeClass = "btn-success";

    angular.extend(toastrConfig, {
      positionClass: 'toast-top-center'
    });

    // Hack for avoiding console errors when no catch is around rejected promise:
    $qProvider.errorOnUnhandledRejections(false);
  }

  function runCommon($rootScope, $log, $transitions, $translate, LocaleHandlerService) {

    $transitions.onError({}, function(transition) {
      $log.info("State Change Error: " + transition.error);
    });

    // listen on route change events and trigger common functionality
    $transitions.onSuccess({}, function(transition) {
      $log.info("From state " + transition.from().name + " to " + transition.to().name);
      if (transition.to().data && transition.to().data.browserTitle && transition.to().data.browserTitle.length > 0) {
        $rootScope.browserTitle = transition.to().data.browserTitle;
        $rootScope.browserTitle = $translate.instant($rootScope.browserTitle);
      } else {
        $rootScope.browserTitle = 'runyourdinner';
      }
    });

    $rootScope.language = LocaleHandlerService.getCurrentLanguage();
    $rootScope.$on('$translateChangeSuccess', function(event, data) {
      $rootScope.language = data.language;
    });

  }

})(angular);
