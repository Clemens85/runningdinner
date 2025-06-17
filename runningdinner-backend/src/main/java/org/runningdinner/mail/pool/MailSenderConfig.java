package org.runningdinner.mail.pool;

public record MailSenderConfig(MailSenderLimit limit, int priority, boolean fallback) {

	public MailSenderConfig(int dailyLimit, int monthlyLimit, int priority, boolean fallback) {
		this(new MailSenderLimit(dailyLimit, monthlyLimit), priority, fallback);
	}

	public boolean hasDailyLimit() {
		return limit != null && limit.hasDailyLimit();
	}

	public boolean hasMonthlyLimit() {
		return limit != null && limit.hasMonthlyLimit();
	}
}
