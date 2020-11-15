package org.runningdinner.core.converter;

/**
 * Exception that is thrown if some error occurs during parsing a file with participants.
 * 
 * @author Clemens Stich
 * 
 */
public class ConversionException extends Exception {

	private static final long serialVersionUID = -5727835165400406188L;

	public enum CONVERSION_ERROR {
		NAME, ADDRESS, PARTICIPANT_NR, NUMBER_OF_SEATS, TOO_MUCH_PARTICIPANTS, UNKNOWN
	}

	public static final int NO_ROW_NUMBER_AVAILABLE = -1;

	private int absoluteRowIndex = NO_ROW_NUMBER_AVAILABLE;
	private int startRowNumberOffset = NO_ROW_NUMBER_AVAILABLE;
	private CONVERSION_ERROR conversionError;

	public ConversionException() {
		super();
	}

	public ConversionException(String message, Throwable arg1) {
		super(message, arg1);
	}

	public ConversionException(String message) {
		super(message);
	}

	public ConversionException(Throwable t) {
		super(t);
	}

	/**
	 * Adds details error information to this exception for displaying it in UI.<br>
	 * 
	 * @param absoluteRowNumber the absolute row-number on which the error occured (0-based)
	 * @param startRowNumberOffset the row-number at which the user wanted the parsing to be started (0-based)
	 * @param errorType
	 * @return This exception instance for being able to call this method in a fluent way
	 */
	public ConversionException setClientErrorInformation(int absoluteRowNumber, int startRowNumberOffset, CONVERSION_ERROR errorType) {
		this.absoluteRowIndex = absoluteRowNumber;
		this.startRowNumberOffset = startRowNumberOffset;
		this.conversionError = errorType;
		return this;
	}

	/**
	 * Adds details error information to this exception for displaying it in UI.<br>
	 * 
	 * @param rowNumber
	 * @param errorType
	 * @return This exception instance for being able to call this method in a fluent way
	 */
	public ConversionException setClientErrorInformation(CONVERSION_ERROR errorType) {
		return setClientErrorInformation(NO_ROW_NUMBER_AVAILABLE, NO_ROW_NUMBER_AVAILABLE, errorType);
	}

	/**
	 * Retrieves the (0-based) absolute number of the row in which the error occurred (or -1 if the row-number is not known)
	 * 
	 * @return
	 */
	public int getAbsoluteRowIndex() {
		return absoluteRowIndex;
	}

	/**
	 * Retrieves the (0-based) row-number at which the user wanted the parsing to be started (or-1 if the row-number is not known on which
	 * an error occurred)
	 * 
	 * @return
	 */
	public int getStartRowNumberOffset() {
		return startRowNumberOffset;
	}

	public boolean isRowNumberAvailable() {
		return absoluteRowIndex != NO_ROW_NUMBER_AVAILABLE;
	}

	/**
	 * Retrieves the type of conversion error for indicating which entity-part of a participant caused the exception.
	 * 
	 * @return
	 */
	public CONVERSION_ERROR getConversionError() {
		if (conversionError == null) {
			return CONVERSION_ERROR.UNKNOWN;
		}
		return conversionError;
	}

}
