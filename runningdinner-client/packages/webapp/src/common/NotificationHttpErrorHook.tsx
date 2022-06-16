import { useTranslation } from "react-i18next";
import {COMMON_ERROR_NAMESPACE, HttpError, isArrayEmpty, isArrayNotEmpty, Issue, Issues, isValidationError} from "@runningdinner/shared";
import {
  getBackendIssuesFromErrorResponse,
  mapBackendIssuesToIssues
} from "@runningdinner/shared";
import {useCustomSnackbar} from "./theme/CustomSnackbarHook";

export interface HttpErrorDefaultNotificationProps {
  /**
   * If set to true a generic error notification will be shown which signals the user to take a look at the form fields. This applies only for validation errors. <br/>
   * Default is true.
   */
  showGenericMesssageOnValidationError?: boolean;

  /**
   * If set to true all errors without a source field will be shown as notification. This applies only for validation errors. <br />
   * If set to true, *AND* there are issues without source, then this setting also overwrites the showGenericMesssageOnValidationError setting, so that no generic
   * validation error notification will be shown.<br/>
   * Default is true
   */
  showMessageForValidationErrorsWithoutSource?: boolean;
}

/**
 * Convenience hook for default error handling on Http errors. This hook simply wraps the {@link useLxNotification} hook for showing notification toasts<br/>
 *
 */
export function useNotificationHttpError(getIssuesTranslated?: (httpError: HttpError) => Issues) {

  const {showError} = useCustomSnackbar();

  const { t } = useTranslation(COMMON_ERROR_NAMESPACE);

  /**
   * This should deal with the most common error cases in Lxo. <br/>
   * If there occurs a validation error (406) it just shows up a generic validation error notification
   * (and/ or shows notifications for all errors without a source (= which cannot be directly shown in a form). <br/>
   * For other errors it just takes the error messages from backend and shows a toast for each one. <br/>
   * If there are no issues provided in an {@link HttpError}, then this function automatically derives a error message based upon the status code.
   *
   * @param httpError
   * @param options Optional options (see {@link HttpErrorDefaultNotificationProps} ) to fine-tune which notifications shall be displayed
   */
  function showHttpErrorDefaultNotification(
      httpError: HttpError,
      options?: HttpErrorDefaultNotificationProps
  ) {

    let issues;
    if (getIssuesTranslated) {
      issues = getIssuesTranslated(httpError);
    } else {
      const backendIssues = getBackendIssuesFromErrorResponse(httpError, false);
      issues = mapBackendIssuesToIssues(backendIssues);
    }

    let optionsToUse = options
        ? options
        : {
          showMessageForValidationErrorsWithoutSource: true,
          showGenericMesssageOnValidationError: true,
        };

    if (isValidationError(httpError)) {
      if (isArrayNotEmpty(issues.issuesWithoutField) && optionsToUse.showMessageForValidationErrorsWithoutSource !== false) {
        showErrorNotification(issues.issuesWithoutField);
      } else if (optionsToUse.showGenericMesssageOnValidationError !== false) {
        const errorMessage = t("validation_error_desc");
        showError(errorMessage);
      }
      return;
    }

    const allIssues = issues.issuesWithoutField.concat(issues.issuesFieldRelated);
    if (isArrayEmpty(allIssues)) {
      const translationKey = mapHttpErrorStatusCodeToTranslationKey(httpError);
      const message = t(translationKey);
      allIssues.push({
        error: {
          message,
        },
      });
    }
    showErrorNotification(allIssues);
  }

  function showErrorNotification(errorItems: Issue[]) {
    errorItems.forEach((errorItem) => showError(errorItem.error.message));
  }

  return {
    showHttpErrorDefaultNotification,
  };
}

function mapHttpErrorStatusCodeToTranslationKey(httpError: HttpError) {
  const statusCode = httpError?.response?.status;
  if (statusCode === 406) {
    return "validation_error_desc";
  }
  return "generic_error_label";
}
