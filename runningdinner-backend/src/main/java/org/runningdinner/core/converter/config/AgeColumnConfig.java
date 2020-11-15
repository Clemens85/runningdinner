package org.runningdinner.core.converter.config;

public class AgeColumnConfig extends AbstractColumnConfig {

	public AgeColumnConfig(int columnIndex) {
		super(columnIndex);
	}

	public static AgeColumnConfig noAgeColumn() {
		AgeColumnConfig result = new AgeColumnConfig(UNAVAILABLE_COLUMN_INDEX);
		return result;
	}

	public static AgeColumnConfig createAgeColumn(final int columnIndex) {
		AgeColumnConfig result = new AgeColumnConfig(columnIndex);
		return result;
	}

}
