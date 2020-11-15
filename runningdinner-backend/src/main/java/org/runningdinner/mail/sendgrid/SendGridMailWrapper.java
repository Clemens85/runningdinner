
package org.runningdinner.mail.sendgrid;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.core.util.DateTimeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableMap;
import com.sendgrid.Content;
import com.sendgrid.Email;
import com.sendgrid.Mail;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;

public class SendGridMailWrapper implements MailSender {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(SendGridMailWrapper.class);
  
  private ObjectMapper objectMapper;
  
  private SendGrid sendGridClient;
  
  private boolean htmlEmail;
  
  public SendGridMailWrapper(String sendGridApiKey, ObjectMapper objectMapper, boolean htmlEmail) {

    this.objectMapper = objectMapper;
    this.sendGridClient = new SendGrid(sendGridApiKey);
    this.htmlEmail = htmlEmail;
  }

  @Override
  public void send(SimpleMailMessage simpleMessage) {

    
    Email from = new Email(simpleMessage.getFrom());
    Email to = new Email(simpleMessage.getTo()[0]);
    
    LOGGER.info("Sending mail to {}", simpleMessage.getTo()[0]);
    
    Content content = new Content(htmlEmail ? "text/html" : "text/plain", simpleMessage.getText());
    Mail mail = new Mail(from, simpleMessage.getSubject(), to, content);
    mail.setReplyTo(new Email(simpleMessage.getReplyTo()));

    SendGrid sg = getSendGridClient();
    Request request = new Request();
    Response response;
    try {
      request.method = Method.POST;
      request.endpoint = "mail/send";
      request.body = mail.build();
      response = sg.api(request);
    } catch (IOException ex) {
      throw new TechnicalException(ex);
    }
    
    if (!isSuccessful(response)) {
      throw new TechnicalException(simpleMessage + " could not be sent, response was " + responseToString(response));
    }
  }

  @Override
  public void send(SimpleMailMessage... simpleMessages) {

    for (SimpleMailMessage simpleMessage : simpleMessages) {
      send(simpleMessage);
    }
  }
  
  public List<SuppressedEmail> findBounces(LocalDateTime from) {
    
    List<SuppressedEmail> bounces = findSuppressedEmails("suppression/bounces", from);
    bounces.forEach(b -> b.setFailureType(FailureType.BOUNCE));
    return bounces;
  }
  
  public List<SuppressedEmail> findInvalidMails(LocalDateTime from) {
    
    List<SuppressedEmail> invalidEmails = findSuppressedEmails("suppression/invalid_emails", from);
    invalidEmails.forEach(b -> b.setFailureType(FailureType.INVALID_EMAIL));
    return invalidEmails;
  }
  
  public List<SuppressedEmail> findSpamEmails(LocalDateTime from) {

    List<SuppressedEmail> result = findSuppressedEmails("suppression/spam_reports", from);
    result.forEach(b -> b.setFailureType(FailureType.SPAM));
    return result;
  }
  
  public List<SuppressedEmail> findBlockedEmails(LocalDateTime from) {

    List<SuppressedEmail> result = findSuppressedEmails("suppression/blocks", from);
    result.forEach(b -> b.setFailureType(FailureType.BLOCKED));
    return result;
  }
  
  public boolean deleteInvalidMails(Collection<String> emails) {
    
    return deleteSuppressedEmails("suppression/invalid_emails", emails);
  }
  
  public boolean deleteBounces(Collection<String> emails) {

    return deleteSuppressedEmails("suppression/bounces", emails);
  }
  
  public boolean deleteBlocks(Collection<String> emails) {

    return deleteSuppressedEmails("suppression/blocks", emails);
  }
  
  public boolean deleteSpamEmails(Collection<String> emails) {

    return deleteSuppressedEmails("suppression/spam_reports", emails);
  }
  
  protected List<SuppressedEmail> findSuppressedEmails(String endpoint, LocalDateTime from) {
    
    LOGGER.info("Calling findSuppressedEmails for endpoint {}", endpoint);
    
    try {
      Request request = new Request();
      request.method = Method.GET;
      request.endpoint = endpoint;
      request.queryParams = ImmutableMap.of("start_time", String.valueOf(DateTimeUtil.toUnixTimestamp(from)));
      
      Response response = getSendGridClient().api(request);
      String rawBody = response.body;
      return Arrays.asList(objectMapper.readValue(rawBody, SuppressedEmail[].class));
    } catch (IOException ex) {
      throw new TechnicalException(ex);
    }
  }
  
  protected boolean deleteSuppressedEmails(String endpoint, Collection<String> emails) {
    
    LOGGER.info("Calling deleteSuppressedEmails for endpoint {} with emails {}", endpoint, emails);
    if (1 == 1) {
      // TODO 1: Fix!!! (emails json body is missing!)
      // TODO 2: Delete not when fetching supressed emails, but delete in own scheduler job!
      return true;
    }
    
    String rawJson;
    try {
      rawJson = objectMapper.writeValueAsString(emails);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }

    Request request = new Request();
    request.method = Method.DELETE;
    request.endpoint = endpoint;
    request.body = rawJson;
    
    Response response;
    try {
      response = getSendGridClient().api(request);
    } catch (IOException e) {
      throw new TechnicalException(e);
    }
    
    if (!isSuccessful(response)) {
      LOGGER.error("Response for deleting {} on endpoint {} returned {}", emails, endpoint, responseToString(response));
      return false;
    }
    return true;
  }
  
  protected SendGrid getSendGridClient() {
    
    return sendGridClient;
  }
  
  private static String responseToString(Response response) {
    
    if (response == null) {
      return "Response was null";
    }
    
    return "Status: " + response.statusCode + "; Body:\r\n " + response.body;
  }
  
  private static boolean isSuccessful(Response response) {
    
    return response != null && (response.statusCode >= 200 && response.statusCode < 300);
  }


}
