package org.runningdinner.mail.ses;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.aws.SnsMessage;
import org.runningdinner.common.aws.SnsMessageMapperService;
import org.runningdinner.common.aws.WebhookValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/ses/notifications")
public class AwsSesWebhookRestController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AwsSesWebhookRestController.class);

	private final WebhookValidatorService mailWebhookValidator;

	private final AwsSesEmailSynchronizationService awsSesEmailSynchronizationService;

	private final SnsMessageMapperService snsMessageMapperService;

	public AwsSesWebhookRestController(WebhookValidatorService mailWebhookValidator,
																		 AwsSesEmailSynchronizationService awsSesEmailSynchronizationService,
																		 SnsMessageMapperService snsMessageMapperService) {
		this.mailWebhookValidator = mailWebhookValidator;
		this.awsSesEmailSynchronizationService = awsSesEmailSynchronizationService;
		this.snsMessageMapperService = snsMessageMapperService;
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

		SnsMessage message = snsMessageMapperService.mapToMessageWithAutoConfirm(messageBody);

		if (message.getType().equals("Notification")) {
			LOGGER.info("AWS SES Notification received: {}", message.getMessage());
			awsSesEmailSynchronizationService.handleSesNotification(message.getMessage());
		} else {
			LOGGER.warn("Unknown AWS SES SNS message type: {}", message.getType());
		}

		return ResponseEntity.ok("OK");
	}

}
