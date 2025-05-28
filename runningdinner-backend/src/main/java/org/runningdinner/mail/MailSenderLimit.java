package org.runningdinner.mail;

public class MailSenderLimit {

	private int dailyLimit;
	
	private int monthlyLimit;
	
	public MailSenderLimit(int dailyLimit, int monthlyLimit) {
		this.dailyLimit = dailyLimit;
		this.monthlyLimit = monthlyLimit;
	}

	public int getDailyLimit() {
		return dailyLimit;
	}

	public int getMonthlyLimit() {
		return monthlyLimit;
	}
	
	public boolean hasDailyLimit() {
		return dailyLimit >= 0;
	}
	
	public boolean hasMonthlyLimit() {
		return monthlyLimit >= 0;
	}
}
