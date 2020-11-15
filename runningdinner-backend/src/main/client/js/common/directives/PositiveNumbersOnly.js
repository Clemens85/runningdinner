(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('positiveNumbersOnly', positiveNumbersOnly);

    function positiveNumbersOnly() {
      return {
        require: 'ngModel',
        link: _link
      };

      function _link(scope, element, attr, ngModelCtrl) {
        function fromUser(text) {
          if (text) {
            var transformedInput = text.replace(/[^0-9]/g, '');

            if (transformedInput !== text) {
              ngModelCtrl.$setViewValue(transformedInput);
              ngModelCtrl.$render();
            }
            return transformedInput;
          }
          return '';
        }
        ngModelCtrl.$parsers.push(fromUser);
      }

    }

})(angular);
