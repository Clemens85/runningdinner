(function(angular) {
  'use strict';

  angular.module('FrontendApp').controller('FrontendMainCtrl', FrontendMainCtrl);

  function FrontendMainCtrl($state, $rootScope, LocaleHandlerService) {

    var rootVm = this;
    rootVm.getStartLink = getStartLink;
    rootVm.getPublicDinnerEventsLink = getPublicDinnerEventsLink;
    rootVm.getCreateDinnerEventLink = getCreateDinnerEventLink;
    rootVm.getAboutLink = getAboutLink;
    rootVm.getWizardLink = getWizardLink;
    rootVm.getDemoWizardLink = getDemoWizardLink;
    rootVm.getNewsLink = getNewsLink;

    rootVm.changeLanguage = LocaleHandlerService.changeCurrentLanguage;
    rootVm.language = LocaleHandlerService.getCurrentLanguage();

    function getStartLink() {
      return $state.href('frontend.start');
    }

    function getPublicDinnerEventsLink() {
      return $state.href('frontend.events');
    }

    function getCreateDinnerEventLink() {
      return $state.href('frontend.create');
    }

    function getAboutLink() {
      return $state.href('frontend.impressum');
    }

    function getNewsLink() {
      return $state.href('frontend.news');
    }

    function getWizardLink() {
      return "/wizard.html#!/running-dinner-wizard";
    }

    function getDemoWizardLink() {
      return getWizardLink() + "?demoDinner=true";
    }

    $rootScope.$on('$translateChangeSuccess', function(event, data) {
      rootVm.language = data.language;
    });

  }

})(angular);



