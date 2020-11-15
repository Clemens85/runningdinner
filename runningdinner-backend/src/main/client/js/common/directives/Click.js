(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('uiClick', uiClick);

  function uiClick($parse, ButtonStateService) {

    var enterLoadingState = function (elm) {
      // add loading style
      elm.prop('disabled', true);
      elm.addClass('btn-loading');
    };

    var exitLoadingState = function (elm) {
      // remove loading style
      elm.prop('disabled', false);
      elm.removeClass('btn-loading');
    };

    return {
      restrict: 'A',
      compile: function compile(tElement, tAttrs, transclude) {

        ButtonStateService.registerButton(tElement);

        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
          },
          post: function postLink(scope, iElement, iAttrs, controller) {
            iElement.bind('click', function (event) {
              enterLoadingState(iElement);

              var promise = null;
              // convert expression to function
              var fn = $parse(iAttrs['uiClick']);
              scope.$apply(function () {
                promise = fn(scope);
              });

              if (promise != null) {

                ButtonStateService.enablePromiseBasedButtonState(promise);

                promise.finally(function () {
                  exitLoadingState(iElement);
                });
              } else {
                exitLoadingState(iElement);
              }

            });
          }
        };
      }
    };

  }

})(angular);
