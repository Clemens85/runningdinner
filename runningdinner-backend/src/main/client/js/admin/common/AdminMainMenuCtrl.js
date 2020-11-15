(function(angular) {
  'use strict';


  angular.module('AdminApp').controller('AdminMainMenuCtrl', AdminMainMenuCtrl);

  function AdminMainMenuCtrl($scope, $rootScope, $state, BaseController, LocaleHandlerService, adminId) {

    var vm = this;
    vm.adminId = adminId;
    vm.language = LocaleHandlerService.getCurrentLanguage();

    vm.changeLanguage = changeLanguageImpl;

    BaseController.registerHttpEventListenerAndSetAngularLocale($scope);

    $scope.$state = $state;

    $rootScope.gotoState = BaseController.gotoState;
    $rootScope.goToUrl = BaseController.goToUrl;

    function changeLanguageImpl(langKey) {
      LocaleHandlerService.changeCurrentLanguage(langKey);
      vm.language = langKey;
    }
  }

}(angular));
