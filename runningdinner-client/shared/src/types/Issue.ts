export interface BackendIssue {
  /**
   * The error message
   */
  message: string;

  /**
   * Typically a fieldname for a validation issue
   */
  field?: string;

  /**
   * The type of this issue
   */
  issueType?: string;

  /**
   * True if already translated from backend
   */
  translated?: boolean;
}

/**
 * Represents an error which should be notified to the user (e.g. an HTTP request failed). <br/>
 * This interface is very close to the contract of the form hook API for setting errors, see also {@link https://react-hook-form.com/api#setError}.<br/>
 * We make however some changes in which fields are required and which ones are not required, due to we might also get e.g. backend validation issues that have no source field. <br/>
 */
export interface Issue {
  field?: string;
  error: IssueOption;
}
export interface IssueOption {
  message: string;
  issueType?: string;
  shouldFocus?: boolean;
  translated?: boolean;
}

/**
 * Simple wrapper object which separates {@link Issue} object that could be mapped to a form field (= have a source from the issue) and that cannot be
 * mapped to a form field (have no source from issue)
 */
export interface Issues {
  /**
   * Errors that were converted from {@link BackendIssue} which have a source and can therefore be mapped to a form field.
   */
  issuesFieldRelated: Issue[];
  /**
   * Errors that were converted from {@link BackendIssue} which doesn't a source and can therefore not be mapped to a form field.
   */
  issuesWithoutField: Issue[];
}
