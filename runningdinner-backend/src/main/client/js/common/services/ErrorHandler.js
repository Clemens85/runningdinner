(function(angular) {
  'use strict';

    angular.module('rd.common.services').factory('ErrorHandler', ErrorHandler);

    function ErrorHandler($translate, _, NotificationService, Constants) {

      return {
        handleGlobalHttpError: handleGlobalHttpErrorImpl,
        handleProvidedIssues: handleProvidedIssuesImpl,
        isValidationErrorResponse: isValidationErrorResponseImpl,
        getIssueByMessage: getIssueByMessageImpl,
        getSingleTranslatedIssueMessageFromResponse: getSingleTranslatedIssueMessageFromResponseImpl
      };

      function isValidationErrorResponseImpl(response) {
        return response.status === 406;
      }

      function getIssueByMessageImpl(response, message) {
        var issues = response.data.issues || [];
        for (var i = 0; i < issues.length; i++) {
          if (issues[i].message === message) {
            return issues[i];
          }
        }
        return null;
      }

      function handleGlobalHttpErrorImpl(response, defaultMessage) {

        NotificationService.remove(Constants.NOTIFICATION.GLOBAL_ERROR); // Reset previous ones

        var issueMessages = [];
        if (response.data && response.data !== '' && response.data.issues) {
          issueMessages = getIssueMessages(response.data.issues);
        }
        else {
          if (defaultMessage && defaultMessage.length > 0) {
            issueMessages.push($translate.instant(defaultMessage));
          } else {
            issueMessages.push($translate.instant('generic_error_label'));
          }
        }

        printIssueMessages(issueMessages, Constants.NOTIFICATION.GLOBAL_ERROR);
      }

      function handleProvidedIssuesImpl(providedIssueList, notificationType) {

        NotificationService.remove(notificationType); // Reset previous ones

        var issueMessages = getIssueMessages(providedIssueList, notificationType);
        if (issueMessages.length === 0) {
          return;
        }

        printIssueMessages(issueMessages, notificationType);
      }

      function getSingleTranslatedIssueMessageFromResponseImpl(errorResponse) {
        var issues = _.get(errorResponse, "data.issues", []);
        if (issues.length === 1) {
          return $translate.instant(issues[0].message);
        }
        return null;
      }

      function getIssueMessages(issues, notificationType) {
        var result = [];
        if (issues && issues.length > 0) {
          for (var i = 0; i < issues.length; i++) {
            var issue = issues[i];
            if (isValidationIssue(issue) && notificationType !== Constants.NOTIFICATION.VALIDATION_ERROR) {
              continue;
            }
            result.push(getIssueMessage(issue));
          }
        }
        return result;
      }

      function printIssueMessages(issueMessages, notificationType) {

        if (issueMessages.length === 0) {
          return;
        }

        var errorMessage = '';
        if (issueMessages.length > 1) {
          errorMessage += '<ul>';
          for (var i = 0; i < issueMessages.length; i++) {
            errorMessage += '<li>' + issueMessages[i] + '</li>';
          }
          errorMessage += '</ul>';
        }
        else if (issueMessages.length === 1) {
          errorMessage += '<span>' + issueMessages[0] + '</span>';
        }

        NotificationService.error(errorMessage, notificationType);
      }


      function getIssueMessage(issue) {
        if (issue.message && issue.message.length > 0) {
          return $translate.instant(issue.message);
        }
        return $translate.instant('generic_error_label');
      }

      function isValidationIssue(issue) {
        if (issue && issue.issueType && issue.issueType.length > 0) {
          if (issue.issueType.toUpperCase() === Constants.ISSUE_TYPE.VALIDATION) {
            return true;
          }
        }
        return false;
      }


    }

})(angular);
