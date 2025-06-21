
package org.runningdinner.mail;

import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.message.job.Message;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.mail.pool.MailSenderPoolService;
import org.runningdinner.mail.pool.PoolableMailSender;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class MailService {

  private final MailConfig mailConfig;

  private final MailSenderPoolService mailSenderPoolService;

  public MailService(MailConfig mailConfig, MailSenderPoolService mailSenderPoolService) {
    this.mailConfig = mailConfig;
    this.mailSenderPoolService = mailSenderPoolService;
  }

  public void sendMessage(MessageTask messageTask) {

    checkEmailValid(messageTask);
    PoolableMailSender poolableMailSender = getMailSenderForTask(messageTask);
    MailSender mailSenderToUse = poolableMailSender.getMailSender();

    SimpleMailMessage simpleMailMessage = messageTask.getMessage().toSimpleMailMessage();
    simpleMailMessage.setTo(messageTask.getRecipientEmail());
    simpleMailMessage.setFrom(poolableMailSender.getFromAddress());
    
    if (mailConfig.isHtmlEmail()) {
      String text = simpleMailMessage.getText();
      text = FormatterUtil.getHtmlFormattedMessage(text);
      simpleMailMessage.setText(text);
    }

    if (mailSenderToUse instanceof JavaMailSender javaMailSender) {
      MimeMessagePreparator preparator = prepareMessage(simpleMailMessage);
      javaMailSender.send(preparator);
    } else {
      mailSenderToUse.send(simpleMailMessage);
    }
  }

  public List<MessageTask> newMessageTasks(MessageJob parentMessageJob, RunningDinner runningDinner, int numMessageTasks) {
    PoolableMailSender mailSenderToUse = mailSenderPoolService.getMailSenderToUse(LocalDate.now(), numMessageTasks);
    String mailProviderKey = mailSenderToUse.getKey().toString();
    return IntStream.range(0, numMessageTasks)
              .mapToObj((i) -> new MessageTask(parentMessageJob, runningDinner, mailProviderKey))
              .toList();
  }

  public MessageTask newSingleMessageTask(MessageJob parentMessageJob, RunningDinner runningDinner) {
    return newMessageTasks(parentMessageJob, runningDinner, 1).getFirst();
  }

  public MessageTask newVirtualMessageTask(String recipientEmail, Message message) {
    PoolableMailSender mailSenderToUse = mailSenderPoolService.getMailSenderToUse(LocalDate.now(), 1);
    String mailProviderKey = mailSenderToUse.getKey().toString();
    return MessageTask.newVirtualMessageTask(recipientEmail, message, mailProviderKey);
  }

  private MimeMessagePreparator prepareMessage(final SimpleMailMessage simpleMailMessage) {

   return new MimeMessagePreparator() {
      
      @Override
      public void prepare(MimeMessage mimeMessage) throws Exception {
        mimeMessage.setHeader("X-SES-CONFIGURATION-SET", "runyourdinner");
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
        helper.setFrom(simpleMailMessage.getFrom());
        helper.setTo(simpleMailMessage.getTo());
        helper.setReplyTo(simpleMailMessage.getReplyTo());
        helper.setSubject(simpleMailMessage.getSubject());
        helper.setText(simpleMailMessage.getText(), mailConfig.isHtmlEmail());
      }
    };
  }

  protected void checkEmailValid(final MessageTask messageTask) {

    String recipientEmail = messageTask.getRecipientEmail();
    if (StringUtils.isEmpty(recipientEmail) || !recipientEmail.contains("@")) {
      throw new MailParseException("Invalid email (" + recipientEmail + ") in " + messageTask);
    }
  }

  /**
   * Default behavior: Return the application-configured mailSender.<br>
   * In future, it may also return a self-configured mailSender from User (hence some settings of running-dinner must be considered)
   * @return MailSender that shall be used
   */
  protected PoolableMailSender getMailSenderForTask(MessageTask messageTask) {
    String sender = messageTask.getSender();
    Assert.hasText(sender, "Sender must not be empty");
    PoolableMailSender result = mailSenderPoolService.getMailSenderByKey(sender);
    Assert.notNull(result, "No MailSender found for key: " + sender);
    return result;
  }
}




//public void checkEmailConnection(MailServerSettings mailServerSettings, String testEmailAddress, String testSubject, String testMessage)
//throws MailServerConnectionFailedException {
//MailSender customMailSender = createCustomMailSender(mailServerSettings);
//
//SimpleMailMessage mailMessage = new SimpleMailMessage();
//mailMessage.setSubject(testSubject);
//mailMessage.setTo(testEmailAddress);
//mailMessage.setText(testMessage);
//mailMessage.setFrom(mailServerSettings.getFrom());
//
//if (StringUtils.isNotEmpty(mailServerSettings.getReplyTo())) {
//mailMessage.setReplyTo(mailServerSettings.getReplyTo());
//}
//
//try {
//customMailSender.send(mailMessage);
//}
//catch (MailAuthenticationException authEx) {
//throw new MailServerConnectionFailedException(authEx).setMailConnectionError(MAIL_CONNECTION_ERROR.AUTHENTICATION);
//}
//catch (MailSendException sendEx) {
//throw new MailServerConnectionFailedException(sendEx).setMailConnectionError(MAIL_CONNECTION_ERROR.SEND);
//}
//catch (Exception ex) {
//throw new MailServerConnectionFailedException(ex).setMailConnectionError(MAIL_CONNECTION_ERROR.UNKNOWN);
//}
//}
//
//private MailSender createCustomMailSender(final MailServerSettings mailServerSettings) {
//JavaMailSenderImpl result = new JavaMailSenderImpl();
//result.setHost(mailServerSettings.getMailServer());
//
//if (mailServerSettings.hasMailServerPort()) {
//result.setPort(mailServerSettings.getMailServerPort());
//}
//
//if (mailServerSettings.isUseAuth()) {
//result.setUsername(mailServerSettings.getUsername());
//result.setPassword(mailServerSettings.getPassword());
//result.getJavaMailProperties().put("mail.smtp.auth", "true");
//}
//else {
//result.getJavaMailProperties().put("mail.smtp.auth", "false");
//}
//
//boolean useTls = mailServerSettings.isUseTls();
//result.getJavaMailProperties().put("mail.smtp.starttls.enable", String.valueOf(useTls));
//result.setDefaultEncoding("UTF-8");
//
//return result;
//}
