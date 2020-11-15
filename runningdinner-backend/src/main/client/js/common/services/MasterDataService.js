(function(angular) {
  'use strict';

  angular.module('rd.common.services').service('MasterDataService', MasterDataService);

  function MasterDataService(RestClientService, Constants, $translate, CommonRequests) {

    return {
      loadGenders: loadGenders,
      loadRegistrationTypes: loadRegistrationTypes,
      loadGenderAspects: loadGenderAspects,
      getGenderName: getGenderName,
      getGenderClass: getGenderClass
    };

    function loadGenders() {
      return RestClientService.execute(CommonRequests.findGenders, {});
    }

    function loadRegistrationTypes() {
      return RestClientService.execute(CommonRequests.findRegistrationTypes, {});
    }

    function loadGenderAspects() {
      return RestClientService.execute(CommonRequests.findGenderAspects, {});
    }

    function getGenderName(gender) {
      if (gender && gender !== Constants.GENDER.UNDEFINED) {
        return gender === Constants.GENDER.MALE ? $translate.instant('gender_male') : $translate.instant('gender_female');
      }
      return $translate.instant('gender_unknown');
    }

    function getGenderClass(gender) {
      if (gender && gender !== Constants.GENDER.UNDEFINED) {
        return gender === Constants.GENDER.MALE ? "fa-mars" : "fa-venus";
      }
      return "fa-genderless";
    }
  }

})(angular);
