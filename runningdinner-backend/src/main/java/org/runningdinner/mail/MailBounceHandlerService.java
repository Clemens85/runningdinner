package org.runningdinner.mail;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.mail.pool.MailSenderPoolService;
import org.runningdinner.mail.pool.PoolableMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MailBounceHandlerService {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailBounceHandlerService.class);

	private final MessageService messageService;

	private final MailSenderPoolService mailSenderPoolService;

	public MailBounceHandlerService(MessageService messageService, MailSenderPoolService mailSenderPoolService, MailService mailService) {
		this.messageService = messageService;
		this.mailSenderPoolService = mailSenderPoolService;
	}

	public void handleBounces(List<MessageTask> messageTasks, Map<String, SuppressedEmail> suppressedEmailMap, boolean allowResend) {
		for (var messageTask : messageTasks) {
			SuppressedEmail suppressedEmail = suppressedEmailMap.get(MailUtil.normalizeEmailAddress(messageTask.getRecipientEmail()));
			if (suppressedEmail == null) {
				LOGGER.warn("Could not find suppressed email for message task {} with recipient email {}", messageTask.getId(), messageTask.getRecipientEmail());
				continue;
			}
			handleBounce(messageTask, suppressedEmail, allowResend);
		}
	}

	protected void handleBounce(MessageTask messageTask, SuppressedEmail suppressedEmail, boolean allowResend) {
		LOGGER.info("Handling bounce for message task {} with recipient email {} and failure type {} and allowResend {}",
								messageTask.getId(), messageTask.getRecipientEmail(), suppressedEmail.getFailureType(), allowResend);

		if (allowResend && canResend(messageTask, suppressedEmail)) {
			boolean resentSuccessfully = tryResendWithAlternativeProvider(messageTask);
			if (resentSuccessfully) {
				return;
			}
		}
		messageService.updateMessageTaskAsFailedInNewTransaction(messageTask.getId(), suppressedEmail);
	}

	/**
	 * Attempts to resend a failed MessageTask using an alternative provider, if possible and not already resent.
	 * Returns true if a resend was attempted, false otherwise.
	 */
	protected boolean tryResendWithAlternativeProvider(MessageTask messageTask) {
		String originalProvider = messageTask.getSender();
		Optional<PoolableMailSender> alternativeSender = mailSenderPoolService.getAlternativeMailSender(LocalDate.now(), 1, originalProvider);
		if (alternativeSender.isEmpty()) {
			LOGGER.warn("Cannot resend message task {} with recipient email {} since no alternative provider is available to original provider {}", messageTask.getId(), messageTask.getRecipientEmail(), originalProvider);
			return false;
		}
		try {
			messageService.resendWithAlternativeProviderInNewTransaction(messageTask.getId(), alternativeSender.get().getKey());
			return true;
		} catch (Exception e) {
			LOGGER.error("Error when trying to resend message task {} with alternative provider {} instead of original provider {}", messageTask.getId(), alternativeSender.get().getKey(), originalProvider, e);
			return false;
		}
	}

	protected static boolean canResend(MessageTask messageTask, SuppressedEmail suppressedEmail) {
		if (messageTask.getResendCount() > 0 || messageTask.getSendingResult().isDelieveryFailed()) {
			LOGGER.info("Cannot resend message task {} with recipient email {} since it was already resent once", messageTask.getId(), messageTask.getRecipientEmail());
			return false;
		}
		FailureType failureType = suppressedEmail.getFailureType();
		var result = failureType == FailureType.BOUNCE || failureType == FailureType.BLOCKED || failureType == FailureType.SPAM;
		if (!result) {
			LOGGER.info("Cannot resend message task {} with recipient email {} since failure type is {}", messageTask.getId(), messageTask.getRecipientEmail(), failureType);
		}
		return result;
	}
}
