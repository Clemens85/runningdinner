package org.runningdinner.mail.pool;

import org.runningdinner.mail.MailProvider;
import org.springframework.mail.MailSender;

public class PoolableMailSender {
	
	private final MailProvider key;

	private final MailSender mailSender;
	
	private final MailSenderLimit mailSenderLimit;

	private final int priority;

	private final boolean fallback;
	
	public PoolableMailSender(MailProvider key, MailSender mailSender, MailSenderConfig config) {
		this(key, mailSender, config.limit(), config.priority(), config.fallback());
	}

	public PoolableMailSender(MailProvider key, MailSender mailSender, MailSenderLimit mailSenderLimit, int priority, boolean fallback) {
		this.key = key;
		this.mailSender = mailSender;
		this.mailSenderLimit = mailSenderLimit;
		this.priority = priority;
		this.fallback = fallback;
	}

	public MailSender getMailSender() {
		return mailSender;
	}

	public MailProvider getKey() {
		return key;
	}

	public MailSenderLimit getMailSenderLimit() {
		return mailSenderLimit;
	}

	public boolean hasDailyLimit() {
		return mailSenderLimit != null && mailSenderLimit.dailyLimit() > 0;
	}

	public boolean hasMonthlyLimit() {
		return mailSenderLimit != null && mailSenderLimit.monthlyLimit() > 0;
	}

	public int getPriority() {
		return priority;
	}

	public boolean isFallback() {
		return fallback;
	}

	@Override
	public String toString() {
		return key.toString();
	}
}
