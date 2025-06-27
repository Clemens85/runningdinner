package org.runningdinner.mail.mailjet;

public class MailJetNotification {

	private String event;

	private long time;

	private String email;

	private String MessageID;

	private Boolean blocked;

	private String error_related_to;
	private String error;

	private String comment;

	// Getters and Setters

	public String getEvent() {
		return event;
	}

	public void setEvent(String event) {
		this.event = event;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}



	public String getMessageID() {
		return MessageID;
	}

	public void setMessageID(String messageID) {
		MessageID = messageID;
	}

	public String getError_related_to() {
		return error_related_to;
	}

	public void setError_related_to(String error_related_to) {
		this.error_related_to = error_related_to;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Boolean getBlocked() {
		return blocked;
	}

	public void setBlocked(Boolean blocked) {
		this.blocked = blocked;
	}
}
