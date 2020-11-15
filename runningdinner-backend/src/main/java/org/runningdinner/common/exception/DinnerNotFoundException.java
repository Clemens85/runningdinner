package org.runningdinner.common.exception;

public class DinnerNotFoundException extends RuntimeException {

	private static final long serialVersionUID = 1347609946273869803L;

	public DinnerNotFoundException() {
		super();
	}

	public DinnerNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}

	public DinnerNotFoundException(String message) {
		super(message);
	}

	public DinnerNotFoundException(Throwable cause) {
		super(cause);
	}
}
