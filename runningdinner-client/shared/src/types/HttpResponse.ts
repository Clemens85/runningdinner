import {BackendIssue} from '..';
import {isArrayNotEmpty} from "../Utils";

/**
 * In order to avoid hard dependencies to a http fetch library (like e.g. axios) we encapsulate an HTTP error in an own interface.
 */
export interface HttpError {
  response: HttpResponse;
}

/**
 * In order to avoid hard dependencies to a http fetch library (like e.g. axios) we encapsulate an HTTP response in an own interface.
 */
export interface HttpResponse {
  /**
   * Contains the response body
   */
  data: any;

  /**
   * The response status
   */
  status: number;
}

export function newHttpError(status: number, issues?: BackendIssue[]): HttpError {
  const result = {
    response: {
      status,
      data: {},
    },
  };

  if (isArrayNotEmpty(issues)) {
    // @ts-expect-error no issue
    result.response.data.issues = issues;
  }
  return result;
}
