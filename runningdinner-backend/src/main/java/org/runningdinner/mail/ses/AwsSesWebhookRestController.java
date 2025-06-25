package org.runningdinner.mail.ses;

import org.runningdinner.common.aws.SnsMessage;
import org.runningdinner.common.aws.SnsValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/ses/notifications")
public class AwsSesWebhookRestController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AwsSesWebhookRestController.class);

	private final SnsValidator snsValidator = new SnsValidator();

	private final AwsSesEmailSynchronizationService awsSesEmailSynchronizationService;

	public AwsSesWebhookRestController(AwsSesEmailSynchronizationService awsSesEmailSynchronizationService) {
		this.awsSesEmailSynchronizationService = awsSesEmailSynchronizationService;
	}

	@PostMapping
	public ResponseEntity<String> handleNotification(@RequestBody SnsMessage message) {
		LOGGER.info("Received AWS SES SNS message: {}", message.getType());

		if (!snsValidator.isMessageValid(message)) {
			LOGGER.warn("Invalid AWS SES Notification SNS message signature. Ignoring. Message was {}", message);
			return ResponseEntity.status(403).body("Invalid signature");
		}

		switch (message.getType()) {
			case "SubscriptionConfirmation":
				snsValidator.confirmSubscription(message);
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

}
