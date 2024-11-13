package org.runningdinner.mail;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.core.util.EnvUtilService;
import org.runningdinner.mail.mailjet.MailJetWrapper;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.mail.sendgrid.SendGridMailWrapper;
import org.runningdinner.mail.ses.AwsSesWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.Properties;

@Component
public class MailSenderFactory {

  private static final Logger LOGGER = LoggerFactory.getLogger(MailSenderFactory.class);
  
  private final MailConfig mailConfig;
  
  private final EnvUtilService envUtilService;
  
  private final ObjectMapper objectMapper; // Maybe needed later on for sendgrid

  private MailSender mailSender;

  public MailSenderFactory(ObjectMapper objectMapper, EnvUtilService envUtilService, MailConfig mailConfig) {
    this.objectMapper = objectMapper;
    this.envUtilService = envUtilService;
    this.mailConfig = mailConfig;
  }

  public MailSender getMailSender() {
    Assert.notNull(mailSender, "Mailsender was not properly initialized");
    return mailSender;
  }
  
  @PostConstruct
  protected void initMailSender() {

    if (envUtilService.isProfileActive("junit") || mailConfig.getActiveMailProvider() == MailProvider.MOCK) {
      LOGGER.info("*** Using mocked In-Memory MailSender ***");
      mailSender = new MailSenderMockInMemory();
      return;
    }

    if (mailConfig.getActiveMailProvider() == MailProvider.SENDGRID_API) {
      LOGGER.info("*** Using SendGrid MailSender ***");
      mailSender = new SendGridMailWrapper(mailConfig.getSendGridApiKey(), objectMapper, mailConfig.isHtmlEmail());
      return;
    }

    if (mailConfig.getActiveMailProvider() == MailProvider.AWS_SES_API) {
      LOGGER.info("*** Using AWS SES MailSender with accessKey {} ***", StringUtils.substring(mailConfig.getUsername(), 0, 5));
      mailSender = new AwsSesWrapper(mailConfig.getUsername(), mailConfig.getPassword(), mailConfig.isHtmlEmail());
      return;
    }

    if (mailConfig.getActiveMailProvider() == MailProvider.MAILJET_API) {
      LOGGER.info("*** Using MailJet MailSender with public API Key {} ***", StringUtils.substring(mailConfig.getMailJetApiKeyPublic(), 0, 5));
      mailSender = new MailJetWrapper(mailConfig.getMailJetApiKeyPublic(), mailConfig.getMailJetApiKeyPrivate(), mailConfig.isHtmlEmail());
      return;
    }

    if (mailConfig.getActiveMailProvider() == MailProvider.SMTP) {
      LOGGER.info("*** Using SMTP MailSender with SMTP Host {} and username {} ***",
                  mailConfig.getHost(), StringUtils.substring(mailConfig.getUsername(), 0, 5));
      mailSender = newJavaSmtpMailSender();
      return;
    }

    throw new IllegalStateException("MailSender not properly initialized. ActiveMailProvider was " + mailConfig.getActiveMailProvider());
  }
  
  private MailSender newJavaSmtpMailSender() {
    
    Assert.hasLength(mailConfig.getHost(), "SMTP Host was empty");
    Assert.hasLength(mailConfig.getUsername(), "SMTP Username was empty");
    
    JavaMailSenderImpl result = new JavaMailSenderImpl();
    result.setHost(mailConfig.getHost());
    result.setPort(mailConfig.getPort());
    result.setUsername(mailConfig.getUsername());
    result.setPassword(mailConfig.getPassword());
    result.setDefaultEncoding("UTF-8");
    Properties javaMailProperties = new Properties();
    javaMailProperties.put("mail.smtp.auth", mailConfig.getUseAuth());
    javaMailProperties.put("mail.smtp.starttls.enable", mailConfig.getEnableStartTls());
    result.setJavaMailProperties(javaMailProperties);
    return result;
  }

  
}
