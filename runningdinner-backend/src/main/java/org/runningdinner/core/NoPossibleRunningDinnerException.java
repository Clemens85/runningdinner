package org.runningdinner.core;

/**
 * Thrown when it is tried to calculate a running dinner with insufficient options.
 * 
 * @author Clemens Stich
 * 
 */
public class NoPossibleRunningDinnerException extends Exception {

	private static final long serialVersionUID = -8611468413016877441L;

	public NoPossibleRunningDinnerException() {
		super();
	}

	public NoPossibleRunningDinnerException(String message, Throwable arg1) {
		super(message, arg1);
	}

	public NoPossibleRunningDinnerException(String message) {
		super(message);
	}

	public NoPossibleRunningDinnerException(Throwable t) {
		super(t);
	}

}
