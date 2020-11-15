package org.runningdinner.core.converter.config;

public class MobileNumberColumnConfig extends AbstractColumnConfig {

	protected MobileNumberColumnConfig(int columnIndex) {
		super(columnIndex);
	}

	public static MobileNumberColumnConfig noMobileNumberColumn() {
		MobileNumberColumnConfig result = new MobileNumberColumnConfig(UNAVAILABLE_COLUMN_INDEX);
		return result;
	}

	public static MobileNumberColumnConfig createMobileNumberColumnConfig(final int columnIndex) {
		MobileNumberColumnConfig result = new MobileNumberColumnConfig(columnIndex);
		return result;
	}
}
