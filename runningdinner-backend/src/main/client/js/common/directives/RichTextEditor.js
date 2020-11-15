(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('richTextEditor', richTextEditor);

    // Use: http://suyati.github.io/line-control/

    function richTextEditor($timeout) {

        return {

            require : 'ngModel', // get a hold of NgModelController
            restrict: 'A',

            link: function(scope, element, attrs, ngModelCtrl) {

                element.Editor();
            }
        };

    }

})(angular);
