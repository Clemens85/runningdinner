package org.runningdinner.mail.sendgrid;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import jakarta.annotation.PostConstruct;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SendGridEmailSynchronizationService {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(SendGridEmailSynchronizationService.class);

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private ObjectMapper objectMapper;
  
  @Autowired
  private MailConfig mailConfig;

  @Autowired
  private MailSynchronizationStateRepository mailSynchronizationStateRepository;
  
  private SendGridMailWrapper sendGridMailWrapper;
  
  @PostConstruct
  protected void initializeSendGridMailWrapper() {
    
    if (StringUtils.isNotEmpty(mailConfig.getSendGridApiKey())) {
      this.sendGridMailWrapper = new SendGridMailWrapper(mailConfig.getSendGridApiKey(), objectMapper, mailConfig.isHtmlEmail());
    }
  }

  public Set<String> synchronizeSuppressedEmails(LocalDateTime fromDateTime) {
    
    LocalDateTime synchronizationFromDateTime = fromDateTime.minusMinutes(30); // Add a little offset back

    LOGGER.info("Synchronizing suppressed emails with startTime {}", synchronizationFromDateTime);
    
    Set<String> supressedEmails = new HashSet<>();
    
    supressedEmails.addAll(synchronizeInvalidEmails(synchronizationFromDateTime));
    supressedEmails.addAll(synchronizeBounces(synchronizationFromDateTime));
    supressedEmails.addAll(synchronizeSpamEmails(synchronizationFromDateTime));
    supressedEmails.addAll(synchronizeBlocks(synchronizationFromDateTime));
    return supressedEmails;
  }

  @Transactional
  public MailSynchronizationState createMailSynchronizationState(LocalDateTime synchronizationDate, Set<String> suppressedEmails) {

    MailSynchronizationState result = new MailSynchronizationState(synchronizationDate);
    MailSynchronizationResult synchronizationResult = MailSynchronizationResult.SUCCESS;
    if (CollectionUtils.isNotEmpty(suppressedEmails)) {
      synchronizationResult = MailSynchronizationResult.SUCCESS_WITH_FOUND_SUPRESSIONS;
      result.setAdditionalInformation(StringUtils.join(suppressedEmails));
    }
    result.setSynchronizationResult(synchronizationResult);

    return mailSynchronizationStateRepository.save(result);
  }

  @Transactional
  public MailSynchronizationState createMailSynchronizationState(LocalDateTime synchronizationDate, Exception ex) {

    MailSynchronizationState result = new MailSynchronizationState(synchronizationDate);
    result.setSynchronizationResult(MailSynchronizationResult.ERROR);
    result.setAdditionalInformation(ex.getMessage());

    return mailSynchronizationStateRepository.save(result);
  }

  public Optional<MailSynchronizationState> findLastSuccessfulMailSynchronizationState() {

    return mailSynchronizationStateRepository.findFirstBySynchronizationResultNotOrderBySynchronizationDateDesc(MailSynchronizationResult.ERROR);
  }
  
  private Set<String> synchronizeBlocks(LocalDateTime fromTime) {
    
    List<SuppressedEmail> result = getSendGridMailWrapper().findBlockedEmails(fromTime);
    Set<String> processedEmails = writeSuppressionsToMessageTasks(result, fromTime);
    getSendGridMailWrapper().deleteBlocks(processedEmails);
    return processedEmails;
  }
  
  private Set<String> synchronizeSpamEmails(LocalDateTime fromTime) {

    List<SuppressedEmail> spams = getSendGridMailWrapper().findSpamEmails(fromTime);
    Set<String> processedEmails = writeSuppressionsToMessageTasks(spams, fromTime);
    getSendGridMailWrapper().deleteSpamEmails(processedEmails);
    return processedEmails;
  }

  private Set<String> synchronizeBounces(LocalDateTime fromTime) {

    List<SuppressedEmail> bounces = getSendGridMailWrapper().findBounces(fromTime);
    Set<String> processedEmails = writeSuppressionsToMessageTasks(bounces, fromTime);
    getSendGridMailWrapper().deleteBounces(processedEmails);
    return processedEmails;
  }

  private Set<String> synchronizeInvalidEmails(LocalDateTime fromTime) {
    
    List<SuppressedEmail> invalidEmails = getSendGridMailWrapper().findInvalidMails(fromTime);
    Set<String> processedEmails = writeSuppressionsToMessageTasks(invalidEmails, fromTime);
    getSendGridMailWrapper().deleteInvalidMails(processedEmails);
    return processedEmails;
  }
  
  private Set<String> writeSuppressionsToMessageTasks(List<SuppressedEmail> suppressedEmails, LocalDateTime fromTime) {
    
    Map<String, SuppressedEmail> invalidEmailMapping = normalizeToInvalidEmailMapping(suppressedEmails);

    List<MessageTask> messageTasks = messageService.findNonFailedEndUserMessageTasksByRecipientsStartingFrom(invalidEmailMapping.keySet(), fromTime);
    LOGGER.info("Found {} messageTasks for being rewritten for {} suppressed emails", messageTasks, invalidEmailMapping.size());
    
    Set<String> processedEmails = new HashSet<>();
    for (MessageTask messageTask : messageTasks) {
    
      String recipientEmail = StringUtils.lowerCase(messageTask.getRecipientEmail());
      SuppressedEmail suppressedEmail = invalidEmailMapping.get(recipientEmail);
      LOGGER.info("Rewriting email {} for {}", recipientEmail, messageTask);
      Assert.notNull(suppressedEmail, "Expected SuppressedEmail to be found for " + recipientEmail);
      
      messageService.updateMessageTaskAsFailedInNewTransaction(messageTask.getId(), suppressedEmail);
      
      processedEmails.add(suppressedEmail.getEmail());
    }
    
    return processedEmails;
  }
  
  private static Map<String, SuppressedEmail> normalizeToInvalidEmailMapping(List<SuppressedEmail> suppressedEmails) {
    
    Map<String, SuppressedEmail> result = new HashMap<>();
    for (SuppressedEmail suppressedEmail : suppressedEmails) {
      result.put(StringUtils.lowerCase(suppressedEmail.getEmail()), suppressedEmail);
    }
    return result;
  }
  
  
  protected SendGridMailWrapper getSendGridMailWrapper() {

    Assert.notNull(sendGridMailWrapper, "Service can only be used if SendGrid is active!");
    return sendGridMailWrapper;
  }
  
  
  /**
   * Only needed for tests
   * @param sendGridMailWrapper
   */
  protected void setSendGridMailWrapper(SendGridMailWrapper sendGridMailWrapper) {
  
    this.sendGridMailWrapper = sendGridMailWrapper;
  }

}
