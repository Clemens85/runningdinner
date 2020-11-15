(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('uiBackdrop', uiBackdrop);

    function uiBackdrop($window) {

        var directiveDefinitionObject = {
            restrict : 'A',
            scope : {
                "uiBackdrop" : '='
            },

            link : function(scope, element, attrs) {

                var window = angular.element($window);

                var overlayOpacity = attrs.uiBackdropOpacity || 0.5;

                scope.$watch('uiBackdrop', function (newVal, oldVal) {

                    if (newVal === true) {
                        // display overlay
                        var width = element.width() + "px";
                        var height = element.height() + "px";
                        var position = element.position();
                        var top = position.top + "px";
                        var left = position.left + "px";

                        var overlayDiv = "<div class='ui-backdrop' style='width:" + width + "; height:" + height + ";left:" + left + ";top:" + top + "; opacity:" + overlayOpacity + ";'></div>";
                        element.prepend(overlayDiv);
                    }
                    else {
                        element.children('.ui-backdrop').first().remove();
                    }
                });

                window.bind('resize', function() {

                    var position = element.position();
                    var width = element.width();
                    var height = element.height();

                    var overlay = element.children('.ui-backdrop').first();
                    overlay.css({ "top" : position.top+"px", "left":position.left+"px" , "width":width+"px", "height":height+"px" });
                });
            }
        };

        return directiveDefinitionObject;
    }

})(angular);
