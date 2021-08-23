import {BackendIssue, HttpError, HttpResponse, Issue, Issues} from "../types";
import { isArrayNotEmpty, isStringEmpty, isStringNotEmpty } from "../Utils";

/**
 * Returns a list with {@link BackendIssue} from the passed axios error object
 * @param httpError The http error object from a request (e.g. axios)
 * @param filterValidationErrorResponseOnly If set to true return only Issues if we a validation error response (406)
 */
export function getBackendIssuesFromErrorResponse(httpError: HttpError, filterValidationErrorResponseOnly: boolean): BackendIssue[] {
  let result = new Array<BackendIssue>();

  if (filterValidationErrorResponseOnly && !isValidationError(httpError)) {
    return result;
  }

  const errorResponse = httpError.response;
  if (!errorResponse || !errorResponse.data) {
    return result;
  }

   if (isArrayNotEmpty(errorResponse.data.issues)) {
    result = errorResponse.data.issues as BackendIssue[];
  }
  return result;
}

export function isValidationError(error: HttpError | Error): boolean {
  let errorResponse: HttpResponse | undefined = undefined;
  if ("response" in error) {
    errorResponse = error.response;
  }
  return errorResponse?.status === 406;
}

export function isHttpError(error: any): error is HttpError {
  return error && "response" in error && "status" in error.response;
}

export function getAsHttpErrorOrDefault(error: any, defaultHttpError: HttpError): HttpError {
  if (isHttpError(error)) {
    return error;
  }
  return defaultHttpError;
}

/**
 * Maps backend issues to an object of type of {@link ApplicationErrors} which itself consists just of items of {@link ApplicationError}, which can then later be used for different error handling scenarios.
 * @param backendIssues
 */
export function mapBackendIssuesToIssues(backendIssues: BackendIssue[]): Issues {
  const rawErrors = backendIssues.map((issue, index) => mapBackendIssueToIssue(issue, index === 0));

  const issuesFieldRelated = rawErrors.filter((rawError) => isStringNotEmpty(rawError.field));
  const issuesWithoutField = rawErrors.filter((rawError) => isStringEmpty(rawError.field));

  return {
    issuesFieldRelated,
    issuesWithoutField,
  };
}

export function findIssueByMessage(issues: Issues, message: string) {
  const issuesArr = issues.issuesWithoutField.concat(issues.issuesFieldRelated);
  return findIssueByMessageInArr(issuesArr, message);
}

function findIssueByMessageInArr(issues: Issue[], message: string) {
  const messageLowerCase = message.toLowerCase();
  for (let i = 0; i < issues.length; i++) {
    const issueMessage = issues[i].error.message ? issues[i].error.message.toLowerCase() : undefined;
    if (issueMessage === messageLowerCase) {
      return issues[i];
    }
  }
}

function mapBackendIssueToIssue(issue: BackendIssue, shouldFocus?: boolean): Issue {
  const {field, message, issueType} = issue;

  return {
    field,
    error: {
      message,
      issueType: isStringNotEmpty(issueType) ? issueType : "backend",
      shouldFocus,
      translated: issue.translated
    },
  };
}
