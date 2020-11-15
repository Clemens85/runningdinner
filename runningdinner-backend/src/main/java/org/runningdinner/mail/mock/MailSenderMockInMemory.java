
package org.runningdinner.mail.mock;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;

/**
 * MailSender implementation that just stores its received messages in an internal collection.<br>
 * Should just be used in test environments.
 * 
 * @author Clemens Stich
 * 
 */
public class MailSenderMockInMemory implements MailSender {

  protected Set<SimpleMailMessage> messages = new HashSet<SimpleMailMessage>();

  protected long simulatedMailSendingTimeMillis = 10;

  protected Set<String> ignoreRecipientEmails = new HashSet<>();

  protected Set<String> failingRecipientEmails = new HashSet<>();

  private static Logger LOGGER = LoggerFactory.getLogger(MailSenderMockInMemory.class);

  @Override
  public void send(SimpleMailMessage simpleMessage) throws MailException {

    this.send(
      new SimpleMailMessage[] {
        simpleMessage
      });
  }

  @Override
  public void send(SimpleMailMessage... simpleMessages) throws MailException {

    if (simpleMessages == null) {
      LOGGER.warn("No messages passed!");
      return;
    }

    List<SimpleMailMessage> simpleMessagtesList = Arrays.stream(simpleMessages).filter(s -> !ignoreRecipientEmails.contains(s.getTo()[0])).collect(Collectors.toList());
    if (CollectionUtils.isEmpty(simpleMessagtesList)) {
      return;
    }

    try {
      Thread.sleep(simulatedMailSendingTimeMillis);
    } catch (InterruptedException e) {
      LOGGER.warn("Mail sending was interrupted, cancel all currently passed messages to send", e);
      return;
    }

    if (simpleMessagtesList.size() == 1) {
      LOGGER.info("Sending mail to {}", simpleMessagtesList.get(0).getTo()[0]); // To-field is actually always field... anyway this is just a
      // mock
    } else {
      LOGGER.info("Sending {} mails", simpleMessagtesList.size());
    }

    boolean failingRecipientEmail = simpleMessagtesList.stream().anyMatch(simpleMessage -> failingRecipientEmails.contains(simpleMessage.getTo()[0]));
    if (failingRecipientEmail) {
      throw new TestMailException(simpleMessages.toString());
    }
    
    this.messages.addAll(simpleMessagtesList);
  }

  public Set<SimpleMailMessage> getMessages() {

    return messages;
  }

  public void removeAllMessages() {

    this.messages.clear();
  }

  public void setSimulatedMailSendingTimeMillis(long simulatedMailSendingTimeMillis) {

    this.simulatedMailSendingTimeMillis = simulatedMailSendingTimeMillis;
  }

  public void removeAllIgnoreRecipientEmails() {

    this.ignoreRecipientEmails.clear();
  }

  public void addIgnoreRecipientEmail(String email) {

    this.ignoreRecipientEmails.add(email);
  }

  public void addFailingRecipientEmail(String email) {

    this.failingRecipientEmails.add(email);
  }

  public void removeAllFailingRecipientEmails() {

    this.failingRecipientEmails.clear();
  }
  
  public void setUp() {
    this.removeAllFailingRecipientEmails();
    this.removeAllIgnoreRecipientEmails();
    this.removeAllMessages();
  }

  public static class TestMailException extends MailException {

    private static final long serialVersionUID = 1L;

    public TestMailException(String msg) {
      super(msg);
    }
    
  }
}
