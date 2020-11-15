(function(angular) {
  'use strict';

  angular.module('rd.common.components').directive('inputValidate', inputValidate);

  function inputValidate(FormValidationService, jQuery) {

    var ERROR_CLASS_NAME = "validation-error";
    var HIDE_CLASS_NAME = "ng-hide";

    return {
      replace: false,
      restrict: 'A',
      require: ['^formValidate', 'ngModel'],
      compile: compile
    };

    function compile(elem, attrs, transclude) {
      return {
        post: postLink
      };
    } // End compile

    function postLink($scope, element, attrs, controller) {

      var jqElement = jQuery(element);
      var validateFormCtrl = controller[0];
      var ngModelCtrl = controller[1];
      var modelId = attrs.name || attrs.ngModel;

      FormValidationService.registerFormInputElement(validateFormCtrl.getName(), modelId, ngModelCtrl, jqElement, validateFormCtrl.getPrefixToRemove());

      var jqExtractedElement = FormValidationService.extractValidationStateElement(jqElement);

      if (jqExtractedElement) {
        $scope.$watch(function () {
          return ngModelCtrl.$invalid;
        }, function (newValue, oldValue) {
          if (newValue === true) {
            FormValidationService.notifyEnterInvalidStateListener(jqExtractedElement, jqElement);
            _renderMessage(validateFormCtrl, modelId, jqExtractedElement, true);
          } else {
            FormValidationService.notifyLeaveInvalidStateListener(jqExtractedElement, jqElement);
            _renderMessage(validateFormCtrl, modelId, jqExtractedElement, false);
          }
        });
      }
    }

    function _renderMessage(validateFormCtrl, modelId, jqFormGroupElement, isInvalid) {

      // var formGroup = jqFormGroupElement[0];
      var jqChildren = jqFormGroupElement.find('*');

      if (isInvalid === false) {
        _hide(jqChildren);
        return;
      }

      var messages = FormValidationService.getValidationErrorMessage(validateFormCtrl.getName(), modelId);
      var messageHtml = messages.join('<br />');
      if (!messageHtml || messageHtml.length <= 0) {
        return;
      }
      _show(jqChildren, messageHtml);
    }

    function _show(jqElements, messages) {
      var messageElement = _findMessageElementByClass(jqElements, ERROR_CLASS_NAME);
      if (messageElement) {
        _removeClass(messageElement, HIDE_CLASS_NAME);
        messageElement.innerHTML = /*"<i class='fa fa-exclamation-circle' aria-hidden='true'></i> " + */messages;
      }
    }

    function _hide(jqElements) {
      var messageElement = _findMessageElementByClass(jqElements, ERROR_CLASS_NAME);
      if (messageElement) {
        _addClass(messageElement, HIDE_CLASS_NAME);
        messageElement.innerHTML = '';
      }
    }

    function _findMessageElementByClass(jqElements, className) {
      var result;
      jqElements.each(function(index, element) {
        if (_hasClass(element, className)) {
          result = element;
          return false; // break loop
        }
      });
      return result;
    }

    function _hasClass(element, className) {
      return element.classList.contains(className);
    }

    function _removeClass(element, className) {
      element.classList.remove(className);
    }

    function _addClass(element, className) {
      element.classList.add(className);
    }

  }

})(angular);


