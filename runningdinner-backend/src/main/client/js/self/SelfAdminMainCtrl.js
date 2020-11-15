(function(angular) {
  'use strict';


  angular.module('SelfAdminApp').controller('SelfAdminMainCtrl', SelfAdminMainCtrl);

  function SelfAdminMainCtrl($stateParams, LocaleHandlerService, SelfAdminService) {

    var vm = this;
    vm.changeLanguage = changeLanguageImpl;
    vm.language = LocaleHandlerService.getCurrentLanguage();

    _activate();

    function _activate() {
      SelfAdminService.findSelfAdminSessionDataAsync($stateParams.selfAdministrationId, $stateParams.participantId)
                      .then(function(sessionData) {
                        vm.sessionData = sessionData;
                        vm.language = sessionData.languageCode;
                        LocaleHandlerService.setCurrentLanguageFromRunningDinner(sessionData);
                      });
    }

    function changeLanguageImpl(langKey) {
      LocaleHandlerService.changeCurrentLanguage(langKey);
      vm.language = langKey;
    }
  }

}(angular));
