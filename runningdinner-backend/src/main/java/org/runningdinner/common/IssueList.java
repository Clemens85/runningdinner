package org.runningdinner.common;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class IssueList implements Serializable {

	private static final long serialVersionUID = 1L;

	private List<Issue> issues = new ArrayList<>();

	public IssueList(final Issue singleError) {
		this(Collections.singletonList(singleError));
	}

	public IssueList() {
		super();
	}

	public IssueList(final List<Issue> issues) {
		super();
		this.issues = issues;
	}

	public List<Issue> getIssues() {
		return issues;
	}

	public void setIssues(List<Issue> issues) {
		this.issues = issues;
	}
	
	public void addIssue(final Issue issue) {
		this.issues.add(issue);
	}

	@Override
	public String toString() {
		return issues.toString();
	}

}
