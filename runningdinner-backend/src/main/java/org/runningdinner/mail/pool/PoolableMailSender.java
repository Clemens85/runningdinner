package org.runningdinner.mail.pool;

import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.MailSenderLimit;
import org.springframework.mail.MailSender;

public class PoolableMailSender {
	
	private MailProvider key;

	private MailSender mailSender;
	
	private MailSenderLimit mailSenderLimit;
	
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
	
}
