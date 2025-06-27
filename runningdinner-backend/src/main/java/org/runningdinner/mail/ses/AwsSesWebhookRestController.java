package org.runningdinner.mail.ses;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.aws.SnsMessage;
import org.runningdinner.common.aws.SnsUtil;
import org.runningdinner.mail.MailWebhookValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/ses/notifications")
public class AwsSesWebhookRestController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AwsSesWebhookRestController.class);

	private final MailWebhookValidatorService mailWebhookValidator;

	private final AwsSesEmailSynchronizationService awsSesEmailSynchronizationService;

	private final ObjectMapper objectMapper;

	public AwsSesWebhookRestController(MailWebhookValidatorService mailWebhookValidator,
																		 AwsSesEmailSynchronizationService awsSesEmailSynchronizationService,
																		 ObjectMapper objectMapper) {
		this.mailWebhookValidator = mailWebhookValidator;
		this.awsSesEmailSynchronizationService = awsSesEmailSynchronizationService;
		this.objectMapper = objectMapper;
	}

	@PostMapping(consumes = {"application/json", "text/plain" })
	public ResponseEntity<String> handleNotification(@RequestBody String messageBody,
																									 @RequestParam(value="webhookToken", required = false) String webhookToken) {

		LOGGER.info("Received AWS SES SNS message with token {} and message: {} ...",
								StringUtils.substring(webhookToken, 0, 2), StringUtils.substring(messageBody, 0, 128));

		if (!mailWebhookValidator.isWebhookTokenValid(webhookToken)) {
			LOGGER.warn("Invalid AWS SES Notification SNS message signature. Ignoring. Message was {}", StringUtils.substring(messageBody, 0, 128));
			return ResponseEntity.status(403).body("Invalid token");
		}

		SnsMessage message = mapToMessage(messageBody);

		switch (message.getType()) {
			case "SubscriptionConfirmation":
				SnsUtil.confirmSubscription(message);
				LOGGER.info("AWS SES Notification Subscription confirmed.");
				break;
			case "Notification":
				LOGGER.info("AWS SES Notification received: {}", message.getMessage());
				awsSesEmailSynchronizationService.handleSesNotification(message.getMessage());
				break;
			case "UnsubscribeConfirmation":
				LOGGER.info("Unsubscribe AWS SES Notification confirmation received.");
				break;
			default:
				LOGGER.warn("Unknown AWS SES SNS message type: {}", message.getType());
		}

		return ResponseEntity.ok("OK");
	}

	private SnsMessage mapToMessage(String messageBody) {
		try {
			return objectMapper.readValue(messageBody, SnsMessage.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}

}
