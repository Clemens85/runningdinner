package org.runningdinner.core.converter.config;

public class GenderColumnConfig extends AbstractColumnConfig {

	public GenderColumnConfig(int columnIndex) {
		super(columnIndex);
	}

	public static GenderColumnConfig noGenderColumn() {
		GenderColumnConfig result = new GenderColumnConfig(UNAVAILABLE_COLUMN_INDEX);
		return result;
	}

	public static GenderColumnConfig createGenderColumn(final int columnIndex) {
		GenderColumnConfig result = new GenderColumnConfig(columnIndex);
		return result;
	}
}
