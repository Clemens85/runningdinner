package org.runningdinner.core;

public class InvalidAddressException extends IllegalArgumentException {

	private static final long serialVersionUID = 1L;

	public enum ADDRESS_ERROR {
		ZIP_CITY_INVALID, STREET_STREETNR_INVALID, ADDRESS_FORMAT_INVALID
	}

	private ADDRESS_ERROR errorType = ADDRESS_ERROR.ADDRESS_FORMAT_INVALID;

	public InvalidAddressException() {
		super();
	}

	public InvalidAddressException(String message, Throwable cause) {
		super(message, cause);
	}

	public InvalidAddressException(String s) {
		this(s, ADDRESS_ERROR.ADDRESS_FORMAT_INVALID);
	}

	public InvalidAddressException(String s, ADDRESS_ERROR errorType) {
		super(s);
		this.errorType = errorType;
	}

	public InvalidAddressException(Throwable cause) {
		super(cause);
	}

	public ADDRESS_ERROR getErrorType() {
		return errorType;
	}

}
