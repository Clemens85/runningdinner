package org.runningdinner.mail;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.core.util.EnvUtilService;
import org.runningdinner.mail.mailjet.MailJetWrapper;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.mail.pool.MailSenderLimit;
import org.runningdinner.mail.pool.PoolableMailSender;
import org.runningdinner.mail.sendgrid.SendGridMailWrapper;
import org.runningdinner.mail.ses.AwsSesWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Component
public class MailSenderFactory {

  private static final Logger LOGGER = LoggerFactory.getLogger(MailSenderFactory.class);
  
  private final MailConfig mailConfig;
  
  private final EnvUtilService envUtilService;
  
  private final ObjectMapper objectMapper; // Maybe needed later on for sendgrid

  public MailSenderFactory(ObjectMapper objectMapper, EnvUtilService envUtilService, MailConfig mailConfig) {
    this.objectMapper = objectMapper;
    this.envUtilService = envUtilService;
    this.mailConfig = mailConfig;
  }

  public List<PoolableMailSender> getConfiguredMailSenders() {

  	List<PoolableMailSender> result = new ArrayList<>();
  	
    if (envUtilService.isProfileActive("junit")) {
      LOGGER.info("*** Using mocked In-Memory MailSender ***");
      var mailSender = new MailSenderMockInMemory();
      result.add(new PoolableMailSender(MailProvider.MOCK, mailSender, new MailSenderLimit(-1, -1))); // No limits for mock
      return result;
    }

    if (mailConfig.isSendGridApiEnabled()) {
      LOGGER.info("*** Using SendGrid MailSender ***");
      var mailSender = new SendGridMailWrapper(mailConfig.getSendGridApiKeyMandatory(), objectMapper, mailConfig.isHtmlEmail());
      result.add(new PoolableMailSender(MailProvider.SENDGRID_API, mailSender, mailConfig.getSendGridApiLimits()));
    } else {
      LOGGER.warn("*** SendGrid MailSender is disabled ***");
    }

    if (mailConfig.isAwsSesEnabled()) {
      LOGGER.info("*** Using AWS SES MailSender with accessKey {} ***", StringUtils.substring(mailConfig.getUsernameMandatory(), 0, 5));
      var mailSender = new AwsSesWrapper(mailConfig.getUsernameMandatory(), mailConfig.getPasswordMandatory(), mailConfig.isHtmlEmail());
      result.add(new PoolableMailSender(MailProvider.AWS_SES_API, mailSender, mailConfig.getAwsSesApiLimits()));
    } else {
      LOGGER.warn("*** AWS SES MailSender is disabled ***");
    }

    if (mailConfig.isMailJetApiEnabled()) {
      LOGGER.info("*** Using MailJet MailSender with public API Key {} ***", StringUtils.substring(mailConfig.getMailJetApiKeyPublicMandatory(), 0, 5));
      var mailSender = new MailJetWrapper(mailConfig.getMailJetApiKeyPublicMandatory(), mailConfig.getMailJetApiKeyPrivateMandatory(), mailConfig.isHtmlEmail());
      result.add(new PoolableMailSender(MailProvider.MAILJET_API, mailSender, mailConfig.getMailJetApiLimits()));
    } else {
      LOGGER.warn("*** MailJet MailSender is disabled ***");
    }

    if (mailConfig.isPlainSmtpMailServerEnabled()) {
      LOGGER.info("*** Using SMTP MailSender with SMTP Host {} and username {} without limits ***", mailConfig.getHost(), StringUtils.substring(mailConfig.getUsernameMandatory(), 0, 5));
      var mailSender = newJavaSmtpMailSender();
      result.add(new PoolableMailSender(MailProvider.SMTP, mailSender, new MailSenderLimit(-1, -1))); // No limits for plain SMTP
    }

    Assert.state(!result.isEmpty(), "No MailSender configured. Please check your application properties or environment variables for mail configuration.");
    return result;
  }
  
  private MailSender newJavaSmtpMailSender() {
    
    Assert.hasLength(mailConfig.getHost(), "SMTP Host was empty");

    JavaMailSenderImpl result = new JavaMailSenderImpl();
    result.setHost(mailConfig.getHost());
    result.setPort(mailConfig.getPort());
    result.setUsername(mailConfig.getUsernameMandatory());
    result.setPassword(mailConfig.getPasswordMandatory());
    result.setDefaultEncoding("UTF-8");
    Properties javaMailProperties = new Properties();
    javaMailProperties.put("mail.smtp.auth", mailConfig.getUseAuth());
    javaMailProperties.put("mail.smtp.starttls.enable", mailConfig.getEnableStartTls());
    result.setJavaMailProperties(javaMailProperties);
    return result;
  }

  
}
