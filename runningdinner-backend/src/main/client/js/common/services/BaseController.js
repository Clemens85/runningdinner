(function(angular) {
  'use strict';

    angular.module('rd.common.services').factory('BaseController', BaseController);

    function BaseController($rootScope, $location, $state, $stateParams, $window, ErrorHandler, LocaleHandlerService) {

      return {
        registerHttpEventListenerAndSetAngularLocale: registerHttpEventListenerAndSetAngularLocaleImpl,
        gotoState: gotoState,
        refreshState: refreshStateImpl,
        goToUrl: goToUrlImpl,
        openInNewWindow: openInNewWindowImpl
      };

      function registerHttpEventListenerAndSetAngularLocaleImpl(scope) {

        LocaleHandlerService.changeAngularLocaleToCurrentLanguage();

        var http400EventListener = $rootScope.$on("400", function (event, response) {
            ErrorHandler.handleGlobalHttpError(response);
        });
        var http404EventListener = $rootScope.$on("404", function (event, response) {
            ErrorHandler.handleGlobalHttpError(response);
        });
        var http406EventListener = $rootScope.$on("406", function (event, response) {
            ErrorHandler.handleGlobalHttpError(response);
        });
        var http500EventListener = $rootScope.$on("500", function (event, response) {
            ErrorHandler.handleGlobalHttpError(response);
        });
        var http424EventListener = $rootScope.$on("424", function (event, response) {
          ErrorHandler.handleGlobalHttpError(response);
        });
        var http415EventListener = $rootScope.$on("415", function (event, response) {
          ErrorHandler.handleGlobalHttpError(response);
        });

        scope.$on('$destroy', http404EventListener);
        scope.$on('$destroy', http406EventListener);
        scope.$on('$destroy', http400EventListener);
        scope.$on('$destroy', http500EventListener);
        scope.$on('$destroy', http424EventListener);
        scope.$on('$destroy', http415EventListener);
      }

      function gotoState(stateRef, adminId) {
        if (adminId) {
          $state.go(stateRef, {"adminId": adminId});
        } else {
          $state.go(stateRef);
        }
      }

      function refreshStateImpl(stateRef, adminId) {
        var refreshOptions = {reload: true, notify: true};
        if (adminId) {
          $state.go(stateRef, {"adminId": adminId}, refreshOptions);
        } else {
          $state.go(stateRef, {}, refreshOptions);
        }
      }

      function goToUrlImpl(targetUrl) {
        var currentUrl = $location.path();
        if (currentUrl === targetUrl) {
          // force reload
          $state.transitionTo($state.current, $stateParams, {
            reload: true,
            inherit: false,
            notify: true
          });
        } else {
          if (targetUrl.charAt(0) === '#') {
            targetUrl = targetUrl.substr(1);
          }
          $location.path(targetUrl);
        }
      }

      function openInNewWindowImpl(stateRef, stateParams) {
        var url = $state.href(stateRef, stateParams);
        $window.open(url, '_blank');
      }
    }

})(angular);
