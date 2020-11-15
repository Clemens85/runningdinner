package org.runningdinner.common.exception;

import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;

public class TechnicalException extends RuntimeException {

	private static final long serialVersionUID = -4002967623349067338L;

	private IssueList issues;

	public TechnicalException() {
	}

	public TechnicalException(IssueList issues) {
		this.issues = issues;
	}

	public TechnicalException(Issue issue) {
		this(issue, null);
	}
	
	public TechnicalException(Issue issue, Throwable ex) {
		super(ex);
		this.issues = new IssueList(issue);
	}

	public TechnicalException(String arg0, Throwable arg1) {
		super(arg0, arg1);
	}

	public TechnicalException(String arg0, Throwable arg1, IssueList issues) {
		super(arg0, arg1);
		this.issues = issues;
	}

	public TechnicalException(String arg0) {
		super(arg0);
	}

	public TechnicalException(Throwable arg0) {
		super(arg0);
	}

	public IssueList getIssues() {
		return issues;
	}
}
