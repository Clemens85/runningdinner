(function() {
  'use strict';

  angular.module('rd.common.filters').filter('localDateTime', LocalDateTimeFilter);

  function LocalDateTimeFilter(LocaleHandlerService) {
    return function(dateObj) {
      return LocaleHandlerService.formatLocalDateTime(dateObj);
    };
  }
})();
