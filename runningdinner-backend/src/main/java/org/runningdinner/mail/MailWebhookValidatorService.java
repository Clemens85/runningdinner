package org.runningdinner.mail;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MailWebhookValidatorService {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailWebhookValidatorService.class);

	private final String configuredWebhookToken;

	public MailWebhookValidatorService(@Value("${mail.webhook.token:}") String configuredWebhookToken) {
		this.configuredWebhookToken = configuredWebhookToken;
	}

	public boolean isWebhookTokenValid(String incomingWebhookToken) {
		if (StringUtils.isEmpty(configuredWebhookToken)) {
			LOGGER.warn("No webhook token configured. Incoming token will not be validated.");
			return true; // No token configured, so we do not validate
		}
		else {
			if (StringUtils.isEmpty(incomingWebhookToken)) {
				LOGGER.error("Incoming webhook token is empty, but a token is configured. Validation failed.");
				return false; // Token is required, but not provided
			}
			else {
				return StringUtils.equals(configuredWebhookToken, incomingWebhookToken);
			}
		}
	}
}
