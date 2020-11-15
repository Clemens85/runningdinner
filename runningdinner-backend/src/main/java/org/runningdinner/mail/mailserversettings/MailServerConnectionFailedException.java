package org.runningdinner.mail.mailserversettings;

/**
 * Exception that is thrown on mail connection check when user wants to use a custom mail server
 * 
 * @author Clemens Stich
 *
 */
public class MailServerConnectionFailedException extends Exception {

	private static final long serialVersionUID = -5070710969462849916L;
	
	public enum MAIL_CONNECTION_ERROR {
		AUTHENTICATION, SEND, UNKNOWN
	}
	
	protected MAIL_CONNECTION_ERROR mailConnectionError = MAIL_CONNECTION_ERROR.UNKNOWN;

	public MailServerConnectionFailedException() {
		super();
	}

	public MailServerConnectionFailedException(String message, Throwable cause) {
		super(message, cause);
	}

	public MailServerConnectionFailedException(String message) {
		super(message);
	}

	public MailServerConnectionFailedException(Throwable cause) {
		super(cause);
	}

	public MAIL_CONNECTION_ERROR getMailConnectionError() {
		return mailConnectionError;
	}

	public MailServerConnectionFailedException setMailConnectionError(MAIL_CONNECTION_ERROR mailConnectionError) {
		this.mailConnectionError = mailConnectionError;
		return this;
	}

}
