(function(angular) {
  'use strict';

  angular.module('rd.common.components').factory('BackendIssueProviderService', BackendIssueProviderService);

  function BackendIssueProviderService($q, $translate, UtilService, NotificationService) {

    var issues = null;
    var normalizedIssues = null;

    var hasValidationIssuesWithField;

    return {
      setIssues: setIssuesImpl,
      clearIssues: clearIssuesImpl,
      getValidationErrorMessage: getValidationErrorMessageImpl,
      getValidationStateAsync: getValidationStateAsyncImpl,
      onResetForm: onResetFormImpl
    };

    function setIssuesImpl(formName, errorResponseWithIssues, formElementNames) {

      hasValidationIssuesWithField = false;
      if (angular.isArray(errorResponseWithIssues)) {
        issues = errorResponseWithIssues;
      } else {
        issues = errorResponseWithIssues.data ? errorResponseWithIssues.data.issues : [];
      }

      normalizedIssues = _normalizeIssues(issues, formElementNames);

      if (errorResponseWithIssues && errorResponseWithIssues.status === 406) {
        if (!hasValidationIssuesWithField && normalizedIssues[""]) {
          var messages = [];
          for (var i = 0, normalizedIssue; i < normalizedIssues[""].length; i++) {
            normalizedIssue = normalizedIssues[""][i];
            messages.push(normalizedIssue.message);
          }
          NotificationService.error(messages.join('<br>'), formName);
        } else {
          if (!NotificationService.hasNotificationWithNameInHierarchy(formName)) { // Show tis global notficiation only if not alredy shown (by other (sub-)form):
            NotificationService.error($translate.instant('validation_error_desc'), formName);
          }
        }
      }

    }

    function clearIssuesImpl(formName) {
      issues = [];
    }

    function getValidationErrorMessageImpl(formName, modelId, jqElement) {
      if (normalizedIssues && normalizedIssues[modelId]) {
        for (var i = 0; i < normalizedIssues[modelId].length; i++) {
          var message = normalizedIssues[modelId][i].message;
          if (message) {
            return _getMessageText(message);
          }
        }
      }
      return "Eingabe nicht korrekt";
    }

    function getValidationStateAsyncImpl(formName, modelId, value, ngModelCtrl, serviceOptions) {
      var deferred = $q.defer();
      if (issues === null || issues.length <= 0) {
        deferred.resolve();
      } else {
        if (normalizedIssues[modelId]) {
          deferred.reject();
        } else {
          deferred.resolve();
        }
      }
      return deferred.promise;
    }

    function onResetFormImpl(formName) {
      if (formName) {
        NotificationService.remove(formName);
      }
    }

    function _normalizeIssues(issues, formElementNames) {
      var result = {};
      if (!issues || issues.length <= 0) {
        return result;
      }

      for (var i = 0; i < issues.length; i++) {
        var field;
        if (typeof formElementNames !== 'undefined') {
          var isFieldPresentInForm = formElementNames.indexOf(issues[i].field) > -1;
          field = isFieldPresentInForm ? issues[i].field : '';
          if (!result[field]) {
            result[field] = [];
          }
          result[field].push(issues[i]);
          if (field != null && field.length > 0 && isFieldPresentInForm) {
            hasValidationIssuesWithField = true;
          }
        }
      }
      return result;
    }

    function _getMessageText(incomingMessage) {

      if (/\s/g.test(incomingMessage)) {
        return incomingMessage;
      }
      if ((incomingMessage.indexOf('.') > 0 && incomingMessage.lastIndexOf('.') + 1 < incomingMessage.length) ||
           incomingMessage.indexOf('_') > 0) {
        var i18nKey = UtilService.replaceAll(incomingMessage, '.', '_').toLowerCase();
        return $translate.instant(i18nKey);
      }
      return incomingMessage;
    }
  }

})(angular);
