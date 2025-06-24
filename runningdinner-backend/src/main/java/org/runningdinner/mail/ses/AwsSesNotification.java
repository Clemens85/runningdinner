package org.runningdinner.mail.ses;

import java.util.List;

public class AwsSesNotification {

	private String notificationType;
	private Mail mail;
	private Bounce bounce;
	private Complaint complaint;
	private Delivery delivery;

	public String getNotificationType() {
		return notificationType;
	}

	public void setNotificationType(String notificationType) {
		this.notificationType = notificationType;
	}

	public Mail getMail() {
		return mail;
	}

	public void setMail(Mail mail) {
		this.mail = mail;
	}

	public Bounce getBounce() {
		return bounce;
	}

	public void setBounce(Bounce bounce) {
		this.bounce = bounce;
	}

	public Complaint getComplaint() {
		return complaint;
	}

	public void setComplaint(Complaint complaint) {
		this.complaint = complaint;
	}

	public Delivery getDelivery() {
		return delivery;
	}

	public void setDelivery(Delivery delivery) {
		this.delivery = delivery;
	}

	public static class Mail {
		private String messageId;
		private String source;
		private List<String> destination;
		private String sourceIp;
		private String timestamp;

		public String getMessageId() {
			return messageId;
		}

		public void setMessageId(String messageId) {
			this.messageId = messageId;
		}

		public String getSource() {
			return source;
		}

		public void setSource(String source) {
			this.source = source;
		}

		public String getSourceIp() {
			return sourceIp;
		}

		public void setSourceIp(String sourceIp) {
			this.sourceIp = sourceIp;
		}

		public List<String> getDestination() {
			return destination;
		}

		public void setDestination(List<String> destination) {
			this.destination = destination;
		}

		public String getTimestamp() {
			return timestamp;
		}

		public void setTimestamp(String timestamp) {
			this.timestamp = timestamp;
		}
	}

	public static class Bounce {
		private String bounceType;
		private String bounceSubType;
		private String timestamp;
		private List<BouncedRecipient> bouncedRecipients;

		public String getBounceType() {
			return bounceType;
		}

		public void setBounceType(String bounceType) {
			this.bounceType = bounceType;
		}

		public String getBounceSubType() {
			return bounceSubType;
		}

		public void setBounceSubType(String bounceSubType) {
			this.bounceSubType = bounceSubType;
		}

		public List<BouncedRecipient> getBouncedRecipients() {
			return bouncedRecipients;
		}

		public void setBouncedRecipients(List<BouncedRecipient> bouncedRecipients) {
			this.bouncedRecipients = bouncedRecipients;
		}

		public String getTimestamp() {
			return timestamp;
		}

		public void setTimestamp(String timestamp) {
			this.timestamp = timestamp;
		}

	}

	public static class Complaint {
		private List<ComplainedRecipient> complainedRecipients;
		private String complaintFeedbackType;
		private String timestamp;

		public List<ComplainedRecipient> getComplainedRecipients() {
			return complainedRecipients;
		}

		public void setComplainedRecipients(List<ComplainedRecipient> complainedRecipients) {
			this.complainedRecipients = complainedRecipients;
		}

		public String getComplaintFeedbackType() {
			return complaintFeedbackType;
		}

		public void setComplaintFeedbackType(String complaintFeedbackType) {
			this.complaintFeedbackType = complaintFeedbackType;
		}

		public String getTimestamp() {
			return timestamp;
		}

		public void setTimestamp(String timestamp) {
			this.timestamp = timestamp;
		}
	}

	public static class Delivery {
		private List<String> recipients;
		private String processingTimeMillis;

		public List<String> getRecipients() {
			return recipients;
		}

		public void setRecipients(List<String> recipients) {
			this.recipients = recipients;
		}

		public String getProcessingTimeMillis() {
			return processingTimeMillis;
		}

		public void setProcessingTimeMillis(String processingTimeMillis) {
			this.processingTimeMillis = processingTimeMillis;
		}
	}

	public static class BouncedRecipient {
		private String emailAddress;
		private String action;
		private String status;
		private String diagnosticCode;

		public String getEmailAddress() {
			return emailAddress;
		}

		public void setEmailAddress(String emailAddress) {
			this.emailAddress = emailAddress;
		}

		public String getAction() {
			return action;
		}

		public void setAction(String action) {
			this.action = action;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public String getDiagnosticCode() {
			return diagnosticCode;
		}

		public void setDiagnosticCode(String diagnosticCode) {
			this.diagnosticCode = diagnosticCode;
		}
	}

	public static class ComplainedRecipient {
		private String emailAddress;

		public String getEmailAddress() {
			return emailAddress;
		}

		public void setEmailAddress(String emailAddress) {
			this.emailAddress = emailAddress;
		}
	}

}
