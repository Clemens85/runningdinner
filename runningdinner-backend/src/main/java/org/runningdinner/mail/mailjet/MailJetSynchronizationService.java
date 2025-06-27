package org.runningdinner.mail.mailjet;

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MailJetSynchronizationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailJetSynchronizationService.class);

	private final ObjectMapper objectMapper;

	private final MessageService messageService;

	public MailJetSynchronizationService(ObjectMapper objectMapper, MessageService messageService) {
		this.objectMapper = objectMapper;
		this.messageService = messageService;
	}

	public boolean handleMailJetNotification(String messageBody) {
		LOGGER.info("Received MailJet notification: {} ...", messageBody.substring(0, Math.min(128, messageBody.length())));

		MailJetNotification mailJetNotification = mapToNotification(messageBody);
		if (mailJetNotification == null) {
			return false;
		}

		String event = StringUtils.lowerCase(mailJetNotification.getEvent());
		switch (event) {
			case "bounce":
			case "spam":
			case "blocked":
				handleBounce(mailJetNotification);
				break;
			case "sent":
				handleDelivery(mailJetNotification);
				break;
			default:
				LOGGER.warn("Unhandled MailJet notification event: {}", event);
				return false;
		}

		return true;
	}

	private void handleBounce(MailJetNotification notification) {
		String email = notification.getEmail();
		LOGGER.info("Handling bounce for email: {}", email);

		var messageTasks = findCorrelatedMessageTasks(notification.getTime(), email);
		if (CollectionUtils.isEmpty(messageTasks)) {
			LOGGER.warn("No MessageTasks found for bounced recipient: {}", email);
			return;
		}

		var suppressedEmailMap = mapToSuppressedEmails(notification);
		updateMessageTaskSendingResults(messageTasks, suppressedEmailMap);
	}

	private Map<String, SuppressedEmail> mapToSuppressedEmails(MailJetNotification notification) {
		FailureType failureType = mapFailureType(notification);
		Map<String, SuppressedEmail> result = new HashMap<>();
		SuppressedEmail suppressedEmail = new SuppressedEmail();
		suppressedEmail.setEmail(MailUtil.normalizeEmailAddress(notification.getEmail()));
		suppressedEmail.setFailureType(failureType);
		suppressedEmail.setCreated(notification.getTime());
		suppressedEmail.setReason(getReason(notification));
		result.put(suppressedEmail.getEmail(), suppressedEmail);
		return result;
	}

	private static String getReason(MailJetNotification notification) {
		if (StringUtils.isNotEmpty(notification.getComment())) {
			return notification.getComment();
		}
		String result = StringUtils.isNotBlank(notification.getError_related_to())
				? notification.getError_related_to() + ": " + notification.getError()
				: notification.getError();

		if (StringUtils.isBlank(result)) {
			result = notification.getEvent();
		}
		return result;
	}

	private static FailureType mapFailureType(MailJetNotification notification) {
		String event = notification.getEvent();
		if (notification.getBlocked() != null && notification.getBlocked()) {
			return FailureType.BLOCKED;
		}

		return switch (event) {
			case "spam" -> FailureType.SPAM;
			case "blocked" -> FailureType.BLOCKED;
			default -> FailureType.BOUNCE;
		};
	}

	private List<MessageTask> findCorrelatedMessageTasks(long unixTimestamp, String email) {
		LocalDateTime emailSentTime = DateTimeUtil.fromUnixTimestamp(unixTimestamp);
		LocalDateTime fromTime = emailSentTime.minusHours(2); // Give some offset so that we should for sure get the corresponding MessageTask
		Set<String> normalizedEmailAddresses = Set.of(MailUtil.normalizeEmailAddress(email));
		var result = messageService.findNonFailedEndUserMessageTasksByRecipientsStartingFrom(normalizedEmailAddresses, fromTime);
		return result
						.stream()
						.filter(mt -> StringUtils.equals(mt.getSender(), MailProvider.MAILJET.toString()))
						.toList();
	}

	private MailJetNotification mapToNotification(String messageBody) {
		try {
			return objectMapper.readValue(messageBody, MailJetNotification.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
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

	private static void handleDelivery(MailJetNotification notification) {
		LOGGER.info("MailJet Delivery to {} succeeded", notification.getEmail());
	}

}


