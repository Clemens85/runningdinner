package org.runningdinner.feedback;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.RunningDinnerRepository;
import org.runningdinner.admin.message.job.Message;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.stats.MessageSenderHistoryService;
import org.runningdinner.common.AlertLogger;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.feedback.Feedback.DeliveryState;
import org.runningdinner.mail.MailService;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FeedbackService {

  public static final String SYSTEM_FEEDBACK_SENDER_IP = "SYSTEM_GENERATED";

  private static final long MIN_MILLIS_ALLOWED_BETWEEN_FIRST_LAST_FEEDBACK = 500;

  private static final Duration LAST_MESSAGE_CREATED_AT_OFFSET = Duration.ofMinutes(1);

  private static final int FEEDBACK_RATE_LIMIT_CHECK_SIZE = 3;

  private static final Sort SORTING = Sort.by("createdAt", "id").descending();
  
  @Autowired
  private FeedbackRepository feedbackRepository;

  @Autowired
  private FeedbackConversationRepository feedbackConversationRepository;

  @Autowired
  private RunningDinnerRepository runningDinnerRepository;
  
  @Autowired
  private ValidatorService validatorService;
  
  @Autowired
  private MailService mailService;

  @Autowired
  private MailConfig mailConfig;

  @Autowired
  private MessageSenderHistoryService messageSenderHistoryService;

  @Transactional
  public Feedback createFeedback(Feedback feedback, LocalDateTime now) {

    Assert.state(feedback.isNew(), "Can only create feedback for not yet existing entity, but was " + feedback);
    
    checkNotTooManyFeedbacksInTimeRange(now);
    
    feedback.setDeliveryState(DeliveryState.NOT_DELIVERED);
    return feedbackRepository.save(feedback);
  }
  
  public List<Feedback> findAllNotDeliveredFeedbacks() {

    return feedbackRepository.findByDeliveryState(DeliveryState.NOT_DELIVERED, SORTING);
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public Feedback deliverFeedbackInNewTransaction(Feedback incomingFeedback) {

    Optional<Feedback> feedbackOptional = feedbackRepository.findById(incomingFeedback.getId());
    Assert.state(feedbackOptional.isPresent(), "Could not find feedback for " + incomingFeedback);
    Feedback feedback = feedbackOptional.get();
    Assert.state(feedback.getDeliveryState() == DeliveryState.NOT_DELIVERED, "Can only be called for not delivered feedback, but " + feedback + " was already delivered");

    MessageTask messageTask = newMessageTaskInMemory(feedback);
    mailService.sendMessage(messageTask);

    messageSenderHistoryService.saveMessageSenderHistorySafe(List.of(messageTask));

    feedback.setDeliveryState(DeliveryState.DELIVERED);
    return feedbackRepository.save(feedback);
  }
  
  /**
   * Quite naive method for preventing too many feedbacks...
   */
  private void checkNotTooManyFeedbacksInTimeRange(LocalDateTime now) {

    PageRequest pageable = PageRequest.of(0, FEEDBACK_RATE_LIMIT_CHECK_SIZE, SORTING);
    Page<Feedback> lastCreatedFeedbacksPage = feedbackRepository.findAllBySenderIpNot(SYSTEM_FEEDBACK_SENDER_IP, pageable);
    List<Feedback> lastCreatedFeedbacks = lastCreatedFeedbacksPage.hasContent() ? lastCreatedFeedbacksPage.getContent() : Collections.emptyList();
    if (CollectionUtils.isEmpty(lastCreatedFeedbacks) || lastCreatedFeedbacks.size() < FEEDBACK_RATE_LIMIT_CHECK_SIZE) {
      return;
    }

    Feedback lastCreatedFeedback = lastCreatedFeedbacks.getFirst();
    Feedback firstCreatedFeedback = lastCreatedFeedbacks.getLast();
    
    LocalDateTime lastCreatedAt = lastCreatedFeedback.getCreatedAt();
    LocalDateTime firstCreatedAt = firstCreatedFeedback.getCreatedAt();

    if (lastCreatedAt.isBefore(now.minus(LAST_MESSAGE_CREATED_AT_OFFSET))) {
      return;
    }
    
    long differenceMillis = Math.abs(firstCreatedAt.until(lastCreatedAt, ChronoUnit.MILLIS));
    if (differenceMillis < MIN_MILLIS_ALLOWED_BETWEEN_FIRST_LAST_FEEDBACK) {
      String errorMessage = "Failed to create feedback due to last three feedbacks had been created in " + differenceMillis + " ms (spam suspicion)";
      AlertLogger.logError(errorMessage);
      throw new TechnicalException(errorMessage);
    }
  }
  
  private MessageTask newMessageTaskInMemory(Feedback feedback) {

    Assert.notNull(mailConfig.getContactMailAddress(), "adminEmail must be configured for sending feedback as email");
    
    String subject = "Feedback received from " + feedback.getSenderEmail();
    
    StringBuilder content = new StringBuilder();
    content.append("Page: ").append(feedback.getPageName()).append(FormatterUtil.NEWLINE);
    content.append("IP: ").append(feedback.getSenderIp()).append(FormatterUtil.NEWLINE);
    if (StringUtils.isNotEmpty(feedback.getAdminId())) {
      validatorService.checkAdminIdValid(feedback.getAdminId());
      RunningDinner runningDinner = runningDinnerRepository.findByAdminId(feedback.getAdminId());
      String runningDinnerId = runningDinner != null ? runningDinner.getId().toString() : "null";
      content.append("ID: ").append(runningDinnerId).append(FormatterUtil.NEWLINE);
    }
		content.append("Resolved: ").append(feedback.getResolved()).append(FormatterUtil.NEWLINE);
    
    content.append(FormatterUtil.TWO_NEWLINES);
    content.append("Content: ").append(FormatterUtil.NEWLINE).append(feedback.getMessage());
    
    Message message = new Message(subject, content.toString(), feedback.getSenderEmail());

    return mailService.newVirtualMessageTask(mailConfig.getContactMailAddress(), message);
  }

  @Transactional
  public List<FeedbackConversation> createFeedbackConversations(List<FeedbackConversation> feedbackConversations) {
    Assert.notEmpty(feedbackConversations, "feedbackConversations must not be empty");
    for (FeedbackConversation feedbackConversation : feedbackConversations) {
      Assert.state(feedbackConversation.isNew(), "Can only create feedback conversations for not yet existing entities, but was " + feedbackConversation);
    }
		Assert.state(feedbackConversations.size() <= 2, "Max two FeedbackConversation entities may be provided, but was " + feedbackConversations.size());
    
    // Validate that all threadIds are the same
    UUID firstThreadId = feedbackConversations.getFirst().getThreadId();
    for (FeedbackConversation feedbackConversation : feedbackConversations) {
      Assert.state(firstThreadId.equals(feedbackConversation.getThreadId()), 
                   "All threadIds must be the same, but found different threadIds: " + firstThreadId + " and " + feedbackConversation.getThreadId());
    }
    
    // Validate that a Feedback entity exists for the threadId
    boolean feedbackExists = feedbackRepository.existsByThreadId(firstThreadId);
    Assert.state(feedbackExists, "No Feedback entity found for threadId: " + firstThreadId);
    
    return feedbackConversationRepository.saveAll(feedbackConversations);
  }

  @Transactional
  public Feedback updateResolvedStatus(UUID threadId, FuzzyBoolean resolved) {
    Assert.notNull(threadId, "threadId must not be null");
    Assert.notNull(resolved, "resolved must not be null");
    
    Optional<Feedback> feedbackOptional = feedbackRepository.findByThreadId(threadId);
    Assert.state(feedbackOptional.isPresent(), "No Feedback entity found for threadId: " + threadId);
    
    Feedback feedback = feedbackOptional.get();
    feedback.setResolved(resolved);
    return feedbackRepository.save(feedback);
  }

}
