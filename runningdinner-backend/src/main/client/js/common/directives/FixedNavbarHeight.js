(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('fixedNavbarHeight', fixedNavbarHeight);

  function fixedNavbarHeight($document, $timeout) {

    return {
      restrict: 'AC',
      scope: {
        // Isolate scope so that we can use this directive several times on the same page
      },
      link: function (scope, element, attrs) {

        $timeout(_adjustBodyPadding, 350);

        function _adjustBodyPadding() {
          var navBarHeight = element.height() - 30; // heuristic value for good looking
          var body = angular.element($document).find('body');
          body.css('padding-top', navBarHeight);
        }

        element.bind('resize', function () {
          _adjustBodyPadding();
        });

      }
    };

  }

})(angular);
