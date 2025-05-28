package org.runningdinner.geocoder.response;

import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.geocoder.GeocodeEntityType;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.participant.ParticipantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;

@Service
public class GeocodeResponseHandler {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(GeocodeResponseHandler.class);
	
	private final ParticipantService participantService;
	
	private final ObjectMapper objectMapper;
	
	private final AfterPartyLocationService afterPartyLocationService;
	
	public GeocodeResponseHandler(ParticipantService participantService, ObjectMapper objectMapper, AfterPartyLocationService afterPartyLocationService) {
		this.participantService = participantService;
		this.objectMapper = objectMapper;
		this.afterPartyLocationService = afterPartyLocationService;
	}

	public void processMessage(Message message) throws JsonProcessingException {
		
		GeocodeResponse response = mapToGeocodeResponse(message);
		GeocodingResult geocodingResult = null;
		if (response.body() == null || response.body().geocodingResult() == null) {
			LOGGER.warn("Received empty geocode respone {}, treating this as unresolvable address", response);
			// Create empty result (= not resolved, which is yielded below by setting sync-status to SYNCHRONIZED
			geocodingResult = new GeocodingResult();
		} else {
			geocodingResult = response.body().geocodingResult();
		}
		
		geocodingResult.setSyncStatus(GeocodingSyncStatus.SYNCHRONIZED);
		
		if (StringUtils.equals(response.entityType(), GeocodeEntityType.PARTICIPANT.toString())) {
			UUID participantId = UUID.fromString(response.entityId());
			this.participantService.updateParticipantGeocode(response.adminId(), participantId, geocodingResult);
		} else if (StringUtils.equals(response.entityType(), GeocodeEntityType.AFTER_PARTY_LOCATION.toString())) {
			this.afterPartyLocationService.updateAfterPartyLocationGeocode(response.adminId(), geocodingResult);
		} else {
			throw new IllegalStateException("Unexpected entityType: " + response.entityType());
		}
	}

	private GeocodeResponse mapToGeocodeResponse(Message message) throws JsonProcessingException {
		
		Map<String, MessageAttributeValue> messageAttributes = message.messageAttributes();
		String adminId = getStringAttribute(messageAttributes, "adminId");
		String entityId = getStringAttribute(messageAttributes, "entityId");
		String entityType = getStringAttribute(messageAttributes, "entityType");
		
		GeocodeResponseBody body = objectMapper.readValue(message.body(), GeocodeResponseBody.class);
		
		return new GeocodeResponse(body, adminId, entityId, entityType);
	}
	
	private static String getStringAttribute(Map<String, MessageAttributeValue> messageAttributes, String attributeName) {
		MessageAttributeValue value = messageAttributes.get(attributeName);
		if (value != null) {
			return value.stringValue();
		}
		return null;
	}
	
	
}
