package org.runningdinner.mail.pool;

public record MailSenderLimit(int dailyLimit, int monthlyLimit) {

	public boolean hasDailyLimit() {
		return dailyLimit >= 0;
	}

	public boolean hasMonthlyLimit() {
		return monthlyLimit >= 0;
	}
}
