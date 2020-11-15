(function(angular) {
  'use strict';

  angular.module('rd.common.services', [])
    .factory('jQuery', function ($window) {
      return $window.jQuery;
    })
    .factory('_', function ($window) {
      return $window._;
    })
    .factory('moment', function($window) {
      return $window.moment;
    });

})(angular);

