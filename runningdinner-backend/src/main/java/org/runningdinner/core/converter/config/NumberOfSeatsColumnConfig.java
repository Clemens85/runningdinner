package org.runningdinner.core.converter.config;

public class NumberOfSeatsColumnConfig extends AbstractColumnConfig {

	protected boolean numericDeclaration;

	protected NumberOfSeatsColumnConfig(int columnIndex) {
		super(columnIndex);
	}

	protected void setNumericDeclaration(boolean numericDeclaration) {
		this.numericDeclaration = numericDeclaration;
	}

	public boolean isNumericDeclaration() {
		return numericDeclaration;
	}

	public static NumberOfSeatsColumnConfig noNumberOfSeatsColumn() {
		return new NumberOfSeatsColumnConfig(UNAVAILABLE_COLUMN_INDEX);
	}

	public static NumberOfSeatsColumnConfig newNumericSeatsColumnConfig(final int column) {
		NumberOfSeatsColumnConfig result = new NumberOfSeatsColumnConfig(column);
		result.setNumericDeclaration(true);
		return result;
	}

	public static NumberOfSeatsColumnConfig newBooleanSeatsColumnConfig(final int column) {
		NumberOfSeatsColumnConfig result = new NumberOfSeatsColumnConfig(column);
		result.setNumericDeclaration(false);
		return result;
	}
}
