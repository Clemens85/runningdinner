import { isStringNotEmpty } from '@runningdinner/shared';

/**
 *
 * @param queryParams URLSearchParams
 * @param queryParamName name of URL query param
 * @returns Returns the decoded url query param or an empty string
 */
export function getDecodedQueryParam(queryParams: URLSearchParams, queryParamName: string) {
  const queryParamValue = queryParams.get(queryParamName);
  if (isStringNotEmpty(queryParamValue)) {
    return decodeURI(queryParamValue);
  }
  return '';
}
