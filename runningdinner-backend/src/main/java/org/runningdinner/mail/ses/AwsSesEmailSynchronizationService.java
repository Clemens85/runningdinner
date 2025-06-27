package org.runningdinner.mail.ses;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.MailUtil;
import org.runningdinner.mail.sendgrid.SuppressedEmail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AwsSesEmailSynchronizationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(AwsSesEmailSynchronizationService.class);

  private final ObjectMapper objectMapper;

  private final MessageService messageService;

	public AwsSesEmailSynchronizationService(ObjectMapper objectMapper, MessageService messageService) {
		this.objectMapper = objectMapper;
		this.messageService = messageService;
	}

	public boolean handleSesNotification(String jsonPayload) {
    AwsSesNotification notification = parseMessageJsonPayloadSafe(jsonPayload).orElse(null);
    if (notification == null) {
      return false;
    }

    String type = notification.getNotificationType();
    switch (type) {
      case "Bounce":
        handleBounce(notification);
        break;
      case "Complaint":
        handleComplaint(notification);
        break;
      case "Delivery":
        handleDelivery(notification);
        break;
      case "Reject":
        handleReject(notification);
        break;
      default:
        LOGGER.warn("Unhandled SES notification type: {}", type);
        return false;
    }
    return true;
  }

  private void handleReject(AwsSesNotification notification) {
    AwsSesNotification.Reject reject = notification.getReject();
    if (reject == null) {
      LOGGER.warn("Received Reject notification without reject details: {}", notification);
      return;
    }

    List<String> recipients = notification.getMail() != null ? notification.getMail().getDestination() : Collections.emptyList();
    recipients = recipients == null ? Collections.emptyList() : recipients;

    LOGGER.info("AWS SES Reject for {}: {}", reject.getReason(), recipients);
    var messageTasks = findCorrelatedMessageTasks(notification.getMail(), recipients);
    if (CollectionUtils.isEmpty(messageTasks)) {
      LOGGER.warn("No MessageTasks found for rejected recipients: {}", recipients);
      return;
    }

    LOGGER.info("Handling reject for {} recipients: {}", recipients.size(), recipients);
    var suppressedEmailMap = mapToSuppressedEmails(recipients, reject, notification.getMail().getSourceIp());
    updateMessageTaskSendingResults(messageTasks, suppressedEmailMap);
  }

  private void handleBounce(AwsSesNotification notification) {
    AwsSesNotification.Bounce bounce = notification.getBounce();
    if (bounce == null) {
      return;
    }

    List<AwsSesNotification.BouncedRecipient> bouncedRecipients = getBouncedRecipients(bounce);

    var emails = bouncedRecipients.stream().map(AwsSesNotification.BouncedRecipient::getEmailAddress).distinct().collect(Collectors.toCollection(ArrayList::new));
    var messageTasks = findCorrelatedMessageTasks(notification.getMail(), emails);
    if (CollectionUtils.isEmpty(messageTasks)) {
      LOGGER.warn("No MessageTasks found for bounced recipients: {}", emails);
      return;
    }

    LOGGER.info("Handling bounce for {} recipients: {}", bouncedRecipients.size(), emails);
    var suppressedEmailMap = mapToSuppressedEmails(bouncedRecipients, bounce, notification.getMail().getSourceIp());
    updateMessageTaskSendingResults(messageTasks, suppressedEmailMap);
  }

  private void handleComplaint(AwsSesNotification notification) {
    AwsSesNotification.Complaint complaint = notification.getComplaint();
    if (complaint == null) {
      return;
    }
    List<AwsSesNotification.ComplainedRecipient> complaintRecipients = getComplaintRecipients(complaint);
    LOGGER.info("AWS SES Complaint for {}: {}", complaint.getComplaintFeedbackType(), complaintRecipients);

    var emails = complaintRecipients.stream().map(AwsSesNotification.ComplainedRecipient::getEmailAddress).distinct().collect(Collectors.toCollection(ArrayList::new));
    var messageTasks = findCorrelatedMessageTasks(notification.getMail(), emails);
    if (CollectionUtils.isEmpty(messageTasks)) {
      LOGGER.warn("No MessageTasks found for complaint recipients: {}", emails);
		}

    LOGGER.info("Handling complaint for {} recipients: {}", complaintRecipients.size(), emails);
    var suppressedEmailMap = mapToSuppressedEmails(complaintRecipients, complaint, notification.getMail().getSourceIp());
    updateMessageTaskSendingResults(messageTasks, suppressedEmailMap);
  }

  private void handleDelivery(AwsSesNotification notification) {
    LOGGER.info("AWS SES Delivery to {} succeeded", notification.getDelivery() != null ? notification.getDelivery().getRecipients() : Collections.emptyList());
  }

  private static List<AwsSesNotification.BouncedRecipient> getBouncedRecipients(AwsSesNotification.Bounce bounce) {
    return bounce.getBouncedRecipients() != null ? bounce.getBouncedRecipients() : Collections.emptyList();
  }

  private static List<AwsSesNotification.ComplainedRecipient> getComplaintRecipients(AwsSesNotification.Complaint complaint) {
    return complaint.getComplainedRecipients() != null ? complaint.getComplainedRecipients() : Collections.emptyList();
  }

  // Refer to https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html
  private static FailureType mapBounceToFailureType(AwsSesNotification.Bounce bounce) {
    String bounceType = bounce.getBounceType();
    String bounceSubType = bounce.getBounceSubType();

    if (StringUtils.equals("Permanent", bounceType)) {
      if (StringUtils.equals("General", bounceSubType) || StringUtils.contains(bounceSubType, "Suppress")) {
        return FailureType.BLOCKED;
      }
      return FailureType.INVALID_EMAIL;
    } else if (StringUtils.equals("Transient", bounceType)) {
      return FailureType.BOUNCE;
    }
    return FailureType.BOUNCE;
  }

  private List<MessageTask> findCorrelatedMessageTasks(AwsSesNotification.Mail mail, List<String> recipientEmailAddresses) {
    LocalDateTime emailSentTime = MailUtil.parseIsoTimestampToLocalDateTime(mail.getTimestamp());
    LocalDateTime fromTime = emailSentTime.minusHours(2); // Give some offset so that we should for sure get the corresponding MessageTask
    Set<String> normalizedEmailAddresses = recipientEmailAddresses.stream().map(MailUtil::normalizeEmailAddress).collect(Collectors.toSet());
		var result = messageService.findNonFailedEndUserMessageTasksByRecipientsStartingFrom(normalizedEmailAddresses, fromTime);
    return result
            .stream()
            .filter(mt -> StringUtils.equals(mt.getSender(), MailProvider.AWS_SES.toString()))
            .toList();
  }

  private void updateMessageTaskSendingResults(List<MessageTask> messageTasks, Map<String, SuppressedEmail> suppressedEmailMap) {
    for (var messageTask : messageTasks) {
      SuppressedEmail suppressedEmail = suppressedEmailMap.get(MailUtil.normalizeEmailAddress(messageTask.getRecipientEmail()));
      if (suppressedEmail == null) {
        LOGGER.warn("Could not find suppressed email for message task {} with recipient email {}", messageTask.getId(), messageTask.getRecipientEmail());
        continue;
      }
      messageService.updateMessageTaskAsFailedInNewTransaction(messageTask.getId(), suppressedEmail);
    }
  }

  private static Map<String, SuppressedEmail> mapToSuppressedEmails(List<AwsSesNotification.BouncedRecipient> recipients, AwsSesNotification.Bounce bounce, String source) {
    FailureType failureType = mapBounceToFailureType(bounce);
    Map<String, SuppressedEmail> result = new HashMap<>();
    for (var recipient : recipients) {
      SuppressedEmail suppressedEmail = new SuppressedEmail();
      suppressedEmail.setEmail(MailUtil.normalizeEmailAddress(recipient.getEmailAddress()));
      suppressedEmail.setIp(source);
      suppressedEmail.setFailureType(failureType);
      suppressedEmail.setCreated(MailUtil.parseIsoTimestampToUnixTimestamp(bounce.getTimestamp()));
      suppressedEmail.setReason(getReason(bounce, recipient));
      result.put(suppressedEmail.getEmail(), suppressedEmail);
    }
    return result;
  }

  private static Map<String, SuppressedEmail> mapToSuppressedEmails(List<AwsSesNotification.ComplainedRecipient> recipients, AwsSesNotification.Complaint complaint, String source) {
    Optional<FailureType> failureType = mapComplaintToFailureType(complaint);
    Map<String, SuppressedEmail> result = new HashMap<>();
    for (var recipient : recipients) {
      if (failureType.isEmpty()) {
        continue;
      }
      SuppressedEmail suppressedEmail = new SuppressedEmail();
      suppressedEmail.setEmail(MailUtil.normalizeEmailAddress(recipient.getEmailAddress()));
      suppressedEmail.setIp(source);
      suppressedEmail.setFailureType(failureType.get());
      suppressedEmail.setCreated(MailUtil.parseIsoTimestampToUnixTimestamp(complaint.getTimestamp()));
      suppressedEmail.setReason(complaint.getComplaintFeedbackType());
      result.put(suppressedEmail.getEmail(), suppressedEmail);
    }
    return result;
  }

  private static Map<String, SuppressedEmail> mapToSuppressedEmails(List<String> recipients, AwsSesNotification.Reject reject, String source) {
    FailureType failureType = FailureType.INVALID_EMAIL;
    Map<String, SuppressedEmail> result = new HashMap<>();
    for (var recipient : recipients) {
      SuppressedEmail suppressedEmail = new SuppressedEmail();
      suppressedEmail.setEmail(MailUtil.normalizeEmailAddress(recipient));
      suppressedEmail.setIp(source);
      suppressedEmail.setFailureType(failureType);
      suppressedEmail.setCreated(DateTimeUtil.toUnixTimestamp(LocalDateTime.now()));
      suppressedEmail.setReason(reject.getReason());
      result.put(suppressedEmail.getEmail(), suppressedEmail);
    }
    return result;
  }


  private static Optional<FailureType> mapComplaintToFailureType(AwsSesNotification.Complaint complaint) {
    String complaintFeedbackType = complaint.getComplaintFeedbackType();
    if (StringUtils.equals("not-spam", complaintFeedbackType)) {
      return Optional.empty();
    }
    return Optional.of(FailureType.SPAM);
  }

  private static String getReason(AwsSesNotification.Bounce bounce, AwsSesNotification.BouncedRecipient recipient) {
    String result = bounce.getBounceType();
    if (StringUtils.isNotEmpty(bounce.getBounceSubType())) {
      result += " - " + bounce.getBounceSubType();
    }
    result += ": ";

    if (StringUtils.isNotEmpty(recipient.getDiagnosticCode())) {
      result += recipient.getDiagnosticCode();
    }
    if (StringUtils.isNotEmpty(recipient.getAction())) {
      result += " ( " + recipient.getAction() + ")";
    }
    return result;
  }

  private Optional<AwsSesNotification> parseMessageJsonPayloadSafe(String jsonPayload) {
    try {
      AwsSesNotification notification = objectMapper.readValue(jsonPayload, AwsSesNotification.class);
      if (notification != null && StringUtils.isNotEmpty(notification.getNotificationType())) {
        return Optional.of(notification);
      }
      LOGGER.error("Parsed notification is null or has no notification type: {}", jsonPayload);
      return Optional.empty();
    } catch (JsonProcessingException e) {
      LOGGER.error("Failed to parse JSON payload: {}", jsonPayload, e);
      return Optional.empty();
    }
  }
}
