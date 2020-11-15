package org.runningdinner.wizard.rest;

import java.io.Serializable;

import org.runningdinner.admin.rest.RunningDinnerAdminTO;

public class CreatedRunningDinnerResponseTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private RunningDinnerAdminTO runningDinner;

	private String administrationUrl;

	public CreatedRunningDinnerResponseTO() {
	}

	public CreatedRunningDinnerResponseTO(RunningDinnerAdminTO runningDinner, String administrationUrl) {
		super();
		this.runningDinner = runningDinner;
		this.administrationUrl = administrationUrl;
	}

	public RunningDinnerAdminTO getRunningDinner() {
		return runningDinner;
	}

	public void setRunningDinner(RunningDinnerAdminTO runningDinner) {
		this.runningDinner = runningDinner;
	}

	public String getAdministrationUrl() {
		return administrationUrl;
	}

	public void setAdministrationUrl(String administrationUrl) {
		this.administrationUrl = administrationUrl;
	}

	@Override
	public String toString() {
		return "runningDinner=" + runningDinner + ", administrationUrl=" + administrationUrl;
	}

}
