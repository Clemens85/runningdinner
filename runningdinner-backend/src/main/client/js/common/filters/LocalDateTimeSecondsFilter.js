(function() {
  'use strict';

  angular.module('rd.common.filters').filter('localDateTimeSeconds', LocalDateTimeSecondsFilter);

  function LocalDateTimeSecondsFilter(LocaleHandlerService) {
    return function(dateObj) {
      return LocaleHandlerService.formatLocalDateTimeSeconds(dateObj);
    };
  }
})();
