(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('uiContentHeight', uiContentHeight);

  function uiContentHeight($window, $document, $timeout) {

    return {
      restrict: 'AC',
      scope: {
        // Isolate scope so that we can use this directive several times on the same page
      },
      link: function (scope, element, attrs) {
        var window = angular.element($window),
            document = angular.element($document),
            body = angular.element($document).find('body');

        scope.calculateElementHeight = function() {
          var position = element.position();
          var windowHeight = window.height();

          element.css('overflow-y', 'auto');

          var bodyPaddingTop = parseInt(body.css('padding-top'), 10);

          var calculatedElementHeight = windowHeight - position.top - bodyPaddingTop; // was formerly 140px
          calculatedElementHeight -= parseInt(element.css('padding-bottom'), 10);
          calculatedElementHeight -= parseInt(element.css('margin-bottom'), 10);
          calculatedElementHeight -= parseInt(element.css('border-bottom-width'), 10);
          calculatedElementHeight -= parseInt(element.css('padding-top'), 10);
          calculatedElementHeight -= parseInt(element.css('margin-top'), 10);
          calculatedElementHeight -= parseInt(element.css('border-top-width'), 10);

          element.height(calculatedElementHeight + 'px');
        };

        window.bind('resize', function () {
          scope.calculateElementHeight();
        });

        document.ready(function () {
          $timeout(scope.calculateElementHeight, 450);
        });
      }
    };

  }

})(angular);
