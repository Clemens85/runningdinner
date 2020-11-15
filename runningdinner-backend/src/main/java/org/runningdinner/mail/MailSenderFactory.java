package org.runningdinner.mail;

import java.util.Arrays;
import java.util.Properties;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.core.util.EnvUtilService;
import org.runningdinner.mail.mock.MailSenderMockFile;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.mail.sendgrid.SendGridMailWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class MailSenderFactory {

  private static Logger LOGGER = LoggerFactory.getLogger(MailSenderFactory.class);
  
  @Autowired
  private MailConfig mailConfig;
  
  @Autowired
  private EnvUtilService envUtilService;
  
  @Autowired  
  private ObjectMapper objectMapper; // Maybe needed later on for sendgrid

  private MailSender mailSender;
  
  public MailSender getMailSender() {
    
    Assert.notNull(mailSender, "Mailsender was not properly initialized");
    return mailSender;
  }
  
  @PostConstruct
  protected void initMailSender() {
    
    if (StringUtils.isNotEmpty(mailConfig.getSendGridApiKey())) {
      LOGGER.info("*** Using SendGrid MailSender ***");
      mailSender = new SendGridMailWrapper(mailConfig.getSendGridApiKey(), objectMapper, mailConfig.isHtmlEmail());
    } else if (envUtilService.isProfileActive("junit")) {
      LOGGER.info("*** Using mocked In-Memory MailSender ***");
      mailSender = new MailSenderMockInMemory();
    } else if (envUtilService.isProfileActive("dev")) {
      LOGGER.info("*** Using mocked File based MailSender ***");
      mailSender = new MailSenderMockFile();
    } else {
      LOGGER.info("*** Using SMTP MailSender ***");
      mailSender = newJavaSmtpMailSender();
    }
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
