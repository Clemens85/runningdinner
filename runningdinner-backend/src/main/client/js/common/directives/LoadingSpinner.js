/*
(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('loadingSpinner', loadingSpinner);

  function loadingSpinner($parse, $translate, $timeout) {

    var result = {
      restrict: 'E',
      replace: true,
      template: "<div ng-if='loading || loadingAttribute === true'>" +
                  "<img src='./images/ajax-loader.gif' class='show-inline' />" +
                  "<span style='margin-left:5px;'>Daten werden geladen...</span>" + "<div>Laden: {{ loadingAttribute }}</div>" +
                 "</div>",
      scope : {
        "loadingAttribute" : '=loading'
      },

      link: function (scope, iElement, iAttrs) {
        scope.loading = true;


        //var loadingText = iAttrs['loadingText'];
        //if (!loadingText) {
        //  loadingText = 'loading';
        // }
        // scope.loadingText = "Daten werden geladen..."; //$translate.instant(loadingText);

        // convert expression to function
        if (iAttrs['loadingFunction']) {
          var promise = null;
          var fn = $parse(iAttrs['loadingFunction']);

          $timeout(function() {
            promise = fn(scope);
            if (promise != null) {
              promise.finally(function () {
                scope.loading = false;
              });
            } else {
              scope.loading = false;
            }
          });
        }

      }
    };

    return result;

  }

})(angular);
*/
