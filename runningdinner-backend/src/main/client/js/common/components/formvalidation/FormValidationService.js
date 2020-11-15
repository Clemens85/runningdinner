(function(angular) {
  'use strict';

  angular.module('rd.common.components').factory('FormValidationService', FormValidationService);

  function FormValidationService($q, $timeout, BootstrapFormValidationStateRenderService, BackendIssueProviderService) {

    var forms = {};
    var formElementsByForm = {};

    return {
      setFormController: setFormControllerImpl,
      resetForm: resetFormImpl,
      validateForm: validateFormImpl,
      getValidationErrorMessage: getValidationErrorMessageImpl,
      isFormValid: isFormValidImpl,

      registerFormInputElement: registerFormInputElementImpl,

      notifyEnterInvalidStateListener: notifyEnterInvalidStateListenerImpl,
      notifyLeaveInvalidStateListener: notifyLeaveInvalidStateListenerImpl,
      extractValidationStateElement: extractValidationStateElementImpl
    };

    function setFormControllerImpl(name, formCtrl) {
      forms[name] = formCtrl;
    }

    function isFormValidImpl(name) {
      return forms[name].$valid;
    }

    function registerFormInputElementImpl(formName, modelId, ngModelCtrl, jqElement, prefixToRemove) {

      var formElements = formElementsByForm[formName] || {};
      formElements[modelId] = {
        modelId: modelId,
        ngModelCtrl: ngModelCtrl,
        jqElement: jqElement,
        options: {},
        prefixToRemove: prefixToRemove
      };
      formElementsByForm[formName] = formElements;

      ngModelCtrl.$asyncValidators.asyncChecker = function (value) {
        var deferred = $q.defer();
        var promises = [];

        var mId = modelId;
        if (formElements[modelId].prefixToRemove && mId.indexOf(formElements[modelId].prefixToRemove) === 0) {
          mId = mId.substring(formElements[modelId].prefixToRemove.length);
        }
        var serviceOptions = {};

        promises.push(BackendIssueProviderService.getValidationStateAsync(formName, mId, value, ngModelCtrl, serviceOptions));
        $q.all(promises).then(function () {
          deferred.resolve();
        }).catch(function () {
          deferred.reject();
        });

        return deferred.promise;
      }; // end async validator
    }

    function resetFormImpl(formName) {
      BackendIssueProviderService.onResetForm(formName);

      var formElements = formElementsByForm[formName];
      if (!formElements) {
        return;
      }

      for (var fName in formElements) {
        if (!formElements.hasOwnProperty(fName)) {
          continue;
        }
        var formElement = formElements[fName];
        var asyncCheck = formElement.ngModelCtrl.$validators.asyncChecker;

        delete formElement.ngModelCtrl.$validators.asyncChecker;

        formElement.ngModelCtrl.$validators.asyncChecker = returnTrueFn;
        formElement.ngModelCtrl.$validate();

        delete formElement.ngModelCtrl.$validators.asyncChecker;

        if (typeof asyncCheck === 'function') {
          formElement.ngModelCtrl.$validators.asyncChecker = asyncCheck;
        }
      }

      function returnTrueFn() {
        return true;
      }
    }

    function validateFormImpl(formName, issues) {

      var formElements = formElementsByForm[formName];
      if (!formElements) {
        return;
      }

      var formElementNames = Object.keys(formElements).map(function (prop) {
        return prop;
      });

      BackendIssueProviderService.setIssues(formName, issues, formElementNames);

      for (var fName in formElements) {
        if (!formElements.hasOwnProperty(fName)) {
          continue;
        }
        var formElement = formElements[fName];
        formElement.ngModelCtrl.$validate();
      }

      BackendIssueProviderService.clearIssues(formName);

      $timeout(function () {
        angular.element('form[name="' + formName + '"]').find('.ng-invalid:not(div):visible:first').focus();
      });
    }

    function getValidationErrorMessageImpl(formName, modelId) {
      var result = [];
      var formElements = formElementsByForm[formName] || {};
      var mId = modelId;
      if (formElements[modelId].prefixToRemove && modelId.indexOf(formElements[modelId].prefixToRemove) === 0) {
        mId = modelId.substring(formElements[modelId].prefixToRemove.length);
      }

      var errorMessage = BackendIssueProviderService.getValidationErrorMessage(formName, mId, formElements[modelId].jqElement);
      if (errorMessage) {
        result.push(errorMessage);
      }

      return result;
    }

    function notifyEnterInvalidStateListenerImpl(jqExtractedElement, jqElement) {
      BootstrapFormValidationStateRenderService.onEnterInvalidState(jqExtractedElement, jqElement);
    }

    function notifyLeaveInvalidStateListenerImpl(jqExtractedElement, jqElement) {
      BootstrapFormValidationStateRenderService.onLeaveInvalidState(jqExtractedElement, jqElement);
    }

    function extractValidationStateElementImpl(jqElement) {
      return BootstrapFormValidationStateRenderService.extractValidationStateElement(jqElement);
    }

  }

})(angular);
