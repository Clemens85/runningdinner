package org.runningdinner.core.converter.config;

public class NameColumnConfig {

	private int firstnameColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
	private int lastnameColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;

	protected NameColumnConfig(final int column) {
		this.firstnameColumn = column;
		this.lastnameColumn = column;
	}

	protected NameColumnConfig(final int firstnameColumn, final int lastnameColumn) {
		this.firstnameColumn = firstnameColumn;
		this.lastnameColumn = lastnameColumn;
	}

	public int getFirstnameColumn() {
		return firstnameColumn;
	}

	public int getLastnameColumn() {
		return lastnameColumn;
	}

	public boolean isComposite() {
		return firstnameColumn == lastnameColumn;
	}

	protected void setFirstnameColumn(int firstnameColumn) {
		this.firstnameColumn = firstnameColumn;
	}

	protected void setLastnameColumn(int lastnameColumn) {
		this.lastnameColumn = lastnameColumn;
	}

	protected void setCompositeColumn(int column) {
		this.firstnameColumn = this.lastnameColumn = column;
	}

	public boolean isAvailable() {
		return firstnameColumn != AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX
				&& lastnameColumn != AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
	}

	public static NameColumnConfig createForTwoColumns(final int firstnameColumn, final int lastnameColumn) {
		return new NameColumnConfig(firstnameColumn, lastnameColumn);
	}

	public static NameColumnConfig createForOneColumn(final int column) {
		return new NameColumnConfig(column);
	}
}
