package org.runningdinner.common.exception;

import org.runningdinner.common.IssueList;

public class ValidationException extends RuntimeException {

	private static final long serialVersionUID = -4002967623349067338L;
	
	private IssueList issues;

	public ValidationException() {
	}
	
	public ValidationException(IssueList issues) {
		this.issues = issues;
	}

	public ValidationException(String arg0, Throwable arg1) {
		super(arg0, arg1);
	}

	public ValidationException(String arg0, Throwable arg1, IssueList issues) {
		super(arg0, arg1);
		this.issues = issues;
	}
	
	public ValidationException(String arg0) {
		super(arg0);
	}

	public ValidationException(Throwable arg0) {
		super(arg0);
	}

	public IssueList getIssues() {
		return issues;
	}
}
