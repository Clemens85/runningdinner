package org.runningdinner.common.aws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SnsMessageMapperService {

	private static final Logger LOGGER = LoggerFactory.getLogger(SnsMessageMapperService.class);

	private final ObjectMapper objectMapper;

	public SnsMessageMapperService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public SnsMessage mapToMessageWithAutoConfirm(String messageBody) {
		SnsMessage message = mapToMessage(messageBody);
		switch (message.getType()) {
			case "SubscriptionConfirmation":
				SnsUtil.confirmSubscription(message);
				LOGGER.info("Notification Subscription confirmed for {}", message.getTopicArn());
				break;
			case "UnsubscribeConfirmation":
				LOGGER.info("Unsubscribe confirmation from {} received", message.getTopicArn());
				break;
		}
		return message;
	}

	public SnsMessage mapToMessage(String messageBody) {
		try {
			return objectMapper.readValue(messageBody, SnsMessage.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}
}
