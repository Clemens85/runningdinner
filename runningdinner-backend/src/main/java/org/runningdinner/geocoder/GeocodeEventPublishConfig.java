package org.runningdinner.geocoder;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.runningdinner.queue.QueueProviderFactoryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GeocodeEventPublishConfig {

	private final String senderUrl;

	private final ObjectMapper objectMapper;

	private final QueueProviderFactoryService queueProviderFactoryService;

	public GeocodeEventPublishConfig(@Value("${host.context.url}") String senderUrl,
																	 ObjectMapper objectMapper,
																	 QueueProviderFactoryService queueProviderFactoryService) {
		this.senderUrl = senderUrl;
		this.objectMapper = objectMapper;
		this.queueProviderFactoryService = queueProviderFactoryService;
	}

	public String getSenderUrl() {
		return senderUrl;
	}

	public ObjectMapper getObjectMapper() {
		return objectMapper;
	}

	public QueueProviderFactoryService getQueueProviderFactoryService() {
		return queueProviderFactoryService;
	}
}
