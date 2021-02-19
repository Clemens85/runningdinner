import {BackendIssue, HttpError, HttpResponse, Issue, Issues} from "../types";
import { isArrayNotEmpty, isStringEmpty, isStringNotEmpty } from "../Utils";

/**
 * Returns a list with {@link BackendIssue} from the passed axios error object
 * @param httpError The http error object from a request (e.g. axios)
 * @param filterValidationErrorResponseOnly If set to true return only Issues if we a validation error response (406)
 */
export function getBackendIssuesFromErrorResponse(
    httpError: HttpError,
    filterValidationErrorResponseOnly: boolean
): BackendIssue[] {
  let result = new Array<BackendIssue>();

  if (filterValidationErrorResponseOnly && !isValidationError(httpError)) {
    return result;
  }

  const errorResponse = httpError.response;
  if (!errorResponse || !errorResponse.data) {
    return result;
  }

  if (isArrayNotEmpty(errorResponse.data.IssueList)) {
    // GRLD delievers issues in this way
    result = errorResponse.data.IssueList as BackendIssue[];
  } else if (isArrayNotEmpty(errorResponse.data.issues)) {
    // RDRK deliévers issues in this way
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

/**
 * Maps backend issues to an object of type of {@link ApplicationErrors} which itself consists just of items of {@link ApplicationError}, which can then later be used for different error handling scenarios.
 * @param backendIssues
 */
export function mapBackendIssuesToIssues(
    backendIssues: BackendIssue[]
): Issues {
  const rawErrors = backendIssues.map((issue, index) =>
      mapBackendIssueToIssue(issue, index === 0)
  );

  const issuesFieldRelated = rawErrors.filter((rawError) =>
      isStringNotEmpty(rawError.field)
  );
  const issuesWithoutField = rawErrors.filter((rawError) =>
      isStringEmpty(rawError.field)
  );

  return {
    issuesFieldRelated,
    issuesWithoutField,
  };
}

function mapBackendIssueToIssue(
    issue: BackendIssue,
    shouldFocus?: boolean
): Issue {
  const {
    field,
    message,
    issueType,
  } = issue;

  return {
    field,
    error: {
      message,
      issueType: isStringNotEmpty(issueType) ? issueType : "backend",
      shouldFocus,
    },
  };
}
