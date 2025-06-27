package org.runningdinner.mail.mailjet;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.mail.MailWebhookValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest//mailjet/notifications")
public class MailJetWebhookRestController {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailJetWebhookRestController.class);

	private final MailJetSynchronizationService mailJetSynchronizationService;

	private final MailWebhookValidatorService mailWebhookValidator;

	public MailJetWebhookRestController(MailJetSynchronizationService mailJetSynchronizationService, MailWebhookValidatorService mailWebhookValidator) {
		this.mailJetSynchronizationService = mailJetSynchronizationService;
		this.mailWebhookValidator = mailWebhookValidator;
	}

	@PostMapping(consumes = {"application/json", "text/plain" })
	public ResponseEntity<String> handleEvent(@RequestBody String jsonPayload,
																				 @RequestParam(value="webhookToken", required = false) String webhookToken)  {

		LOGGER.info("Received MailJet message with token {} and message: {} ...",
								StringUtils.substring(webhookToken, 0, 2), StringUtils.substring(jsonPayload, 0, 128));

		if (!mailWebhookValidator.isWebhookTokenValid(webhookToken)) {
			LOGGER.warn("Invalid MailJet Webhook token. Ignoring. Message was {}", StringUtils.substring(jsonPayload, 0, 128));
			return ResponseEntity.status(403).body("Invalid token");
		}

		mailJetSynchronizationService.handleMailJetNotification(jsonPayload);
		return ResponseEntity.ok().build();
	}


}