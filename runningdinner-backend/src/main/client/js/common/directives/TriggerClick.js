(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('uiTriggerClick', uiTriggerClick);

    function uiTriggerClick() {

        var result = {
            compile: function compile(tElement, tAttrs, transclude) {

                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        iElement.bind('click', function (event) {
                            angular.element(iAttrs['uiTriggerClick']).trigger('click');
                        });
                    }
                };
            }
        };

        return result;

    }

})(angular);
