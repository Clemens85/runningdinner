package org.runningdinner.core.converter.config;

/**
 * Abstract base class for a column configuration.<br>
 * Contains the index of a column that shall be read out and whether the information to be read out is available.
 * 
 * @author Clemens Stich
 * 
 */
public abstract class AbstractColumnConfig {

	public static final int UNAVAILABLE_COLUMN_INDEX = Integer.MIN_VALUE;

	protected int columnIndex = UNAVAILABLE_COLUMN_INDEX;

	public AbstractColumnConfig(final int columnIndex) {
		this.columnIndex = columnIndex;
	}

	/**
	 * Index of the column to be read out
	 * 
	 * @return
	 */
	public int getColumnIndex() {
		return columnIndex;
	}

	/**
	 * True if the specified column-index shall be read out
	 * 
	 * @return
	 */
	public boolean isAvailable() {
		return columnIndex != UNAVAILABLE_COLUMN_INDEX;
	}

}
