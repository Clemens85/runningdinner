package org.runningdinner.mail.pool;

public record MailSenderConfig(MailSenderLimit limit, String fromAddress, int priority, boolean fallback) {

	public MailSenderConfig(int dailyLimit, int monthlyLimit, String fromAddress, int priority, boolean fallback) {
		this(new MailSenderLimit(dailyLimit, monthlyLimit), fromAddress, priority, fallback);
	}

	public boolean hasDailyLimit() {
		return limit != null && limit.hasDailyLimit();
	}

	public boolean hasMonthlyLimit() {
		return limit != null && limit.hasMonthlyLimit();
	}
}
