
package org.runningdinner.mail;

import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

@Service
public class MailService {

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  @Autowired
  private MailConfig mailConfig;
  
  public void sendMessage(MessageTask messageTask) {

    checkEmailValid(messageTask);

    SimpleMailMessage simpleMailMessage = messageTask.getMessage().toSimpleMailMessage();
    simpleMailMessage.setTo(messageTask.getRecipientEmail());
    simpleMailMessage.setFrom(mailConfig.getDefaultFrom());
    
    if (mailConfig.isHtmlEmail()) {
      String text = simpleMailMessage.getText();
      text = FormatterUtil.getHtmlFormattedMessage(text);
      simpleMailMessage.setText(text);
    }

    MailSender mailSenderToUse = getMailSender();

    if (mailSenderToUse instanceof JavaMailSender javaMailSender) {
      MimeMessagePreparator preparator = prepareMessage(simpleMailMessage);
      javaMailSender.send(preparator);
    } else {
      mailSenderToUse.send(simpleMailMessage);
    }
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
   * In future it may also return a self-configured mailSender from User (hence some settings of running-dinner must be considered)
   * @return
   */
  protected MailSender getMailSender() {

    return mailSenderFactory.getMailSender();
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
