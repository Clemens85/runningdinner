package org.runningdinner.common;

import java.io.Serializable;

public class Issue implements Serializable {

	private static final long serialVersionUID = 4217976489238246184L;

	/**
	 * Only relevant for validation errors (used e.g. in forms)
	 */
	private String field;

	/**
	 * The (error) message of the issue
	 */
	private String message;

	private IssueType issueType;
	
	private String logKey;

	public Issue() {
		this.issueType = IssueType.TECHNICAL;
	}

	public Issue(String message, IssueType issueType) {
		this.message = message;
		this.issueType = issueType;
	}

	public Issue(String field, String message, IssueType issueType) {
		this.field = field;
		this.message = message;
		this.issueType = issueType;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public IssueType getIssueType() {
		return issueType;
	}

	public void setIssueType(IssueType issueType) {
		this.issueType = issueType;
	}

	public String getField() {
		return field;
	}

	public void setField(String field) {
		this.field = field;
	}
	
	public String getLogKey() {
		return logKey;
	}

	public void setLogKey(String logKey) {
		this.logKey = logKey;
	}

	@Override
	public String toString() {
		return message + ", " + issueType;
	}

}
