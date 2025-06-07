package org.runningdinner.geocoder.response;

import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.geocoder.base.GeocodeResponse;
import org.runningdinner.geocoder.base.GeocodeResponsePersistenceService;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;

@Service
public class GeocodeResponseHandler {
	
	private final GeocodeResponsePersistenceService geocodeResponsePersistenceService;
	
	private final ObjectMapper objectMapper;
	
	public GeocodeResponseHandler(GeocodeResponsePersistenceService geocodeResponsePersistenceService, ObjectMapper objectMapper) {
		this.geocodeResponsePersistenceService = geocodeResponsePersistenceService;
		this.objectMapper = objectMapper;
	}

	public void processMessage(Message message) throws JsonProcessingException {
		GeocodeResponse response = mapToGeocodeResponse(message);
		geocodeResponsePersistenceService.persistGeocodeResponse(response);
	}

	private GeocodeResponse mapToGeocodeResponse(Message message) throws JsonProcessingException {
		
		Map<String, MessageAttributeValue> messageAttributes = message.messageAttributes();
		String adminId = getStringAttribute(messageAttributes, "adminId");
		String entityId = getStringAttribute(messageAttributes, "entityId");
		String entityType = getStringAttribute(messageAttributes, "entityType");
		
		GeocodeSqsResponseBody body = StringUtils.isNotEmpty(message.body()) ? objectMapper.readValue(message.body(), GeocodeSqsResponseBody.class) : null;
		
		return new GeocodeResponse(body != null ? body.geocodingResult() : null, adminId, entityId, entityType);
	}
	
	private static String getStringAttribute(Map<String, MessageAttributeValue> messageAttributes, String attributeName) {
		MessageAttributeValue value = messageAttributes.get(attributeName);
		if (value != null) {
			return value.stringValue();
		}
		return null;
	}
	
	
}
