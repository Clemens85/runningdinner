package org.runningdinner.common.rest;

public class CheckOptionTO {

	private String label;

	private boolean checked;

	public CheckOptionTO() {
	}

	public CheckOptionTO(String label, boolean checked) {
		this.label = label;
		this.checked = checked;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public boolean isChecked() {
		return checked;
	}

	public void setChecked(boolean checked) {
		this.checked = checked;
	}

	@Override
	public String toString() {
		return "label=" + label + ", checked=" + checked;
	}

}
