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