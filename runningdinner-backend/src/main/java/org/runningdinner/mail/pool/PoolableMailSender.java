package org.runningdinner.mail.pool;

import org.runningdinner.mail.MailProvider;
import org.springframework.mail.MailSender;

public class PoolableMailSender {
	
	private final MailProvider key;

	private final MailSender mailSender;
	
	private final MailSenderLimit mailSenderLimit;
	
	public PoolableMailSender(MailProvider key, MailSender mailSender, MailSenderLimit mailSenderLimit) {
		this.key = key;
		this.mailSender = mailSender;
		this.mailSenderLimit = mailSenderLimit;
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
		return mailSenderLimit != null && mailSenderLimit.getDailyLimit() > 0;
	}

	public boolean hasMonthlyLimit() {
		return mailSenderLimit != null && mailSenderLimit.getMonthlyLimit() > 0;
	}
	
}
