(function(angular) {
  'use strict';

  angular
        .module('rd.common.components')
        .directive('rdDatepicker', rdDatepickerDirective);

    function rdDatepickerDirective($timeout, jQuery, $log) {

        return {
            require : 'ngModel', // get a hold of NgModelController
            restrict : 'A',
            link : function(scope, element, attr, ngModelCtrl) {

                // Show dates in standard german format (e.g. 23.02.2012)
                // This is however jquery datepicker convention (only 2 yy's instead of 4 yy's) so in my opinion it doesn't make sense to create a global constant for it
                var dateFormat = 'dd.mm.yy'; //$locale.DATETIME_FORMATS.shortDate; // This is not possible as it gives us dd.MM.yy which does not conform to jqueryUI

                /**
                 * We allow the HTML to specify a minimum date value that the user can choose
                 */
                var minDate = attr.mindate || null; // null means no minimum date restriction

                var blurTimeoutPromise;


                element.addClass('grld-ui-datepicker');

                /**
                 * Main function: Add jquery datepicker to the element and propagate date selections on it to the model. Furthermore we disable tabindex on the date-selection-button
                 */
                element.datepicker({
                    showOn : 'both',
                    buttonText : '',
                    dateFormat : dateFormat,
                    minDate : minDate,
                    onSelect : function(dateText) {
                        ngModelCtrl.$setViewValue(dateText);
                        // For letting the user still use the tab-key, we fake-focus the button of the picker, so that he can advance to the next input control
                        element.next("button.ui-datepicker-trigger").focus();
                        scope.$apply(); // Push changes immediately to model
                    }
                }).next("button.ui-datepicker-trigger").attr("tabIndex", "-1"); // Disable tabulator on selection-btn

                /**
                 *  Select text in input-control whenever user accesses it:
                 */
                element.on('focus', function() {
                    var inputCtrl = this;
                    $timeout.cancel(blurTimeoutPromise);
                    // Delay the text selection a little bit so that datepicker popup happens first and doesn't remove selection again!
                    $timeout(function() {
                        inputCtrl.setSelectionRange(0, inputCtrl.value.length);
                    });
                });

                /**
                 *  hide calendar when datepicker looses focus; need to check with timeout to work with month buttons
                 */
                element.on('blur', function() {
                    var $thisDatepicker = jQuery(this);
                    blurTimeoutPromise = $timeout(function() {
                        if (!$thisDatepicker.is(':focus')) {
                            $thisDatepicker.datepicker("hide");
                        }
                    }, 300);
                });


                // *** Disable also datepicker-button *** //
                var disabledAttr = element.attr("disabled");
                if (typeof disabledAttr !== typeof undefined && disabledAttr !== false) {
                    element.next("button.ui-datepicker-trigger").css("display","none");
                }

                /**
                 * model (scope) => view
                 */
                ngModelCtrl.$formatters.push(function(modelValue) {
                    // Model contains an iso date string:
                    if (angular.isString(modelValue) && modelValue.length > 0) {
                        try {
                            var dateObj = new Date(modelValue);
                            // But we format it nicely according to our custom date format:
                            var formattedViewDate = jQuery.datepicker.formatDate(dateFormat, dateObj);
                            return formattedViewDate;
                        } catch (err) {
                            $log.log("Could not convert model date-str " + modelValue + " to date object: " + err);
                        }
                    }
                });

                /**
                 * view => model (scope)
                 */
                ngModelCtrl.$parsers.push(function(viewValue) {
                    // View contains formatted date string, like "10.01.2014":
                    if (angular.isString(viewValue) && viewValue.length > 0) {
                        try {
                            if (isValidDateString(viewValue)) {
                                var parsedDate = jQuery.datepicker.parseDate(dateFormat, viewValue);
                                // ATOM is ISO 8601 (which is expected by server)
                                var convertedServerDate = jQuery.datepicker.formatDate(jQuery.datepicker.ATOM, parsedDate);
                                return convertedServerDate;
                            }
                        } catch (err) {
                            // If a user manually types in a date-string then he might type in wrong dates. In such a case this exception is thrown and we do nothing.
                            // This exactly conforms to the behaviour of the "old" web-client: A user can manually type in a wrong date which will then be shown as error after server validation
                        }
                    }
                });

                /**
                 * Checks whether the given input string matches our date format
                 * @param dateStr
                 * @returns {boolean}
                 */
                var isValidDateString = function(dateStr) {
                    var result = /^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/.test(dateStr);
                    return result;
                };

                /**
                 * Set formatted date to datepicker:
                 */
                ngModelCtrl.$render = function() {
                    var formattedDateStr = ngModelCtrl.$viewValue;
                    if (angular.isDefined(formattedDateStr)) {
                        element.datepicker("setDate", formattedDateStr);
                    }
                };

            } // end link

        };
    }

})(angular);
