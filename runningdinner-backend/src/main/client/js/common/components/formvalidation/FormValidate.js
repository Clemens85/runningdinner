(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('formValidate', formValidate);

  function formValidate(FormValidationService, jQuery) {

    return {
      replace: false,
      restrict: 'A',
      require: ['formValidate', 'form'],
      controller: 'FormValidationCtrl',
      compile: compile
    };

    function compile(elem, attrs, transclude) {
      var jqElement = jQuery(elem);
      // disable native browser validation
      jqElement.attr('novalidate', '');

      // Main action: Set single input validation directives to each input-field (identified by ng-model)
      _registerFormInputFields(jqElement);

      return {
        pre: preLink
      };
    } // End compile

    function preLink($scope, elem, attrs, controller) {

      var validateFormCtrl = controller[0];
      var formCtrl = controller[1];
      var name = attrs.name;
      validateFormCtrl.setName(name);

      FormValidationService.setFormController(name, formCtrl);
      attrs.$observe('prefix', function (value) {
        validateFormCtrl.setPrefixToRemove(value);
      });

      //register listener to remove validation messages as soon as form is valid again
      var unbindFn = $scope.$watch(function() {
        return formCtrl.$invalid;
      }, function (newValue, oldValue) {
        if (oldValue === true && newValue === false) {
          FormValidationService.resetForm(formCtrl.$name);
        }
      });
      $scope.$on('destroy', unbindFn );
    }

    function _registerFormInputFields(jqFormularElement) {
      jqFormularElement.find('[ng-model]').each(function () {
        var jqElem = jQuery(this);
        var validate = jqElem.attr('input-validate');
        if (validate === 'off') {
          jqElem.removeAttr('input-validate');
        } else {
          jqElem.attr('input-validate', 'on');
        }
      });
    }

  }

})(angular);

