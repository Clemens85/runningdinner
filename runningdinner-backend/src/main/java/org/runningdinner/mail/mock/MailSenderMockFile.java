package org.runningdinner.mail.mock;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;

public class MailSenderMockFile implements MailSender {

	protected Set<SimpleMailMessage> messages = new HashSet<SimpleMailMessage>();

	protected long simulatedMailSendingTimeMillis = 10;

	protected String mailMockDir = StringUtils.EMPTY;

	private static Logger LOGGER = LoggerFactory.getLogger(MailSenderMockFile.class);

	public MailSenderMockFile() {
		this.mailMockDir = System.getProperty("MailMockDir", System.getProperty("java.io.tmpdir"));
	}

	@Override
	public void send(SimpleMailMessage simpleMessage) throws MailException {
		this.send(new SimpleMailMessage[] { simpleMessage });
	}

	@Override
	public void send(SimpleMailMessage[] simpleMessages) throws MailException {
		if (simpleMessages == null) {
			LOGGER.warn("No messages passed!");
			return;
		}

		try {
			Thread.sleep(simulatedMailSendingTimeMillis);
		}
		catch (InterruptedException e) {
			LOGGER.warn("Mail sending was interrupted, cancel all currently passed messages to send", e);
			return;
		}

		if (simpleMessages.length == 1) {
			LOGGER.info("Sending mail to {}", simpleMessages[0].getTo()[0]); // To-field is actually always field... anyway this is just a
																				// mock
		}
		else {
			LOGGER.info("Sending {} mails", simpleMessages.length);
		}

		for (SimpleMailMessage mailMessage : simpleMessages) {
			writeMailMessageToFile(mailMessage);
		}
	}

	public void writeMailMessageToFile(final SimpleMailMessage mailMessage) {
		String[] to = mailMessage.getTo();
		String text = mailMessage.getText();
		String subject = mailMessage.getSubject();

		StringBuilder str = new StringBuilder();
		str.append(subject).append("\r\n\r\n").append(text);
		
		
		try {
      FileUtils.forceMkdir(new File(mailMockDir));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
		
		File mailFile = new File(mailMockDir + System.getProperty("file.separator") + getMailFileName(to[0], (text+subject).hashCode()));
		try {
			FileUtils.writeStringToFile(mailFile, str.toString(), "UTF-8");
		}
		catch (IOException e) {
			throw new MailSendException(e.getMessage(), e);
		}
	}

	private String getMailFileName(final String to, final long uniquePostfix) {
		
		return to.replaceAll("\\.", "_").replaceAll("@", "_") + "_" + uniquePostfix + ".txt";
	}

	public void setSimulatedMailSendingTimeMillis(long simulatedMailSendingTimeMillis) {
		this.simulatedMailSendingTimeMillis = simulatedMailSendingTimeMillis;
	}

}
