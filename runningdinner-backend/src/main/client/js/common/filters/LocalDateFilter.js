(function() {
  'use strict';

  angular.module('rd.common.filters').filter('localDate', LocalDateFilter);

  function LocalDateFilter(LocaleHandlerService) {
    return function(dateObj) {
      return LocaleHandlerService.formatLocalDate(dateObj);
    };
  }
})();
