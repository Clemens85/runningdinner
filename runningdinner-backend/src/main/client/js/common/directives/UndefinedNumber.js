(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('undefinedNumber', undefinedNumber);

  function undefinedNumber(UtilService) {

    var result = {
      require : 'ngModel', // get a hold of NgModelController
      restrict: 'A',
      scope: false,

      link: function(scope, element, attrs, ngModelCtrl) {

        var valueOfUndefinedNumber = attrs.undefinedNumber;
        var isNonPositive = valueOfUndefinedNumber === 'nonpositive';

        ngModelCtrl.$render = function() {
          if (isNonPositive === true && ngModelCtrl.$viewValue < 0) {
            element.val('');
          } else if (ngModelCtrl.$viewValue === valueOfUndefinedNumber) {
            element.val('');
          } else {
            element.val(ngModelCtrl.$viewValue);
          }
        };

        element.bind('blur keyup change', function() {
          scope.$apply(_read);
          ngModelCtrl.$render();
        });

        function _read() {
          var enteredValue = element.val();
          if (!enteredValue || enteredValue.length === 0) {
            var viewValue = isNonPositive === true ? -1 : valueOfUndefinedNumber;
            ngModelCtrl.$setViewValue(viewValue);
          } else if (!UtilService.isPositiveInteger(enteredValue)) {
            ngModelCtrl.$setViewValue(''); // Prevent other chars as numbers to be entered!
          } else {
            ngModelCtrl.$setViewValue(enteredValue);
          }
        }

      }
    };

    return result;

  }

})(angular);
