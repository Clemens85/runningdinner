package org.runningdinner.geocoder.request;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.BaseAddress;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.geocoder.GeocodeEntityType;
import org.runningdinner.participant.Participant;
import org.runningdinner.queue.QueueProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

@Service
public class GeocodeRequestEventPublisher {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(GeocodeRequestEventPublisher.class);
	
	private final String requestQueueUrl;
	
	private final String responseQueueUrl;
	
	private final QueueProvider queueProvider;
	
	private final ObjectMapper objectMapper;
	
  public GeocodeRequestEventPublisher(@Value("${aws.sqs.geocode.request.url}") String requestQueueUrl, 
																			@Value("${aws.sqs.geocode.response.url}") String responseQueueUrl, 
  																	  QueueProvider queueProvider, 
  																	  ObjectMapper objectMapper) {
		this.requestQueueUrl = requestQueueUrl;
		this.responseQueueUrl = responseQueueUrl;
		this.queueProvider = queueProvider;
		this.objectMapper = objectMapper;
	}

	@Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<Void> sendParticipantGeocodingRequestAsync(Participant participant) {
    return sendMessage(participant.getAdminId(), participant.getId().toString(), GeocodeEntityType.PARTICIPANT, participant.getAddress());
  }
	
	@Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<Void> sendAfterPartyLocationGeocodingRequestAsync(RunningDinner runningDinner) {
		AfterPartyLocation afterPartyLocation = runningDinner.getAfterPartyLocation().orElse(null);
		if (afterPartyLocation == null) {
			LOGGER.error("Called sendAfterPartyLocationGeocodingRequestAsync with runningDinner {} without after party location", runningDinner);
			return CompletableFuture.completedFuture(null);
		}
    return sendMessage(runningDinner.getAdminId(), runningDinner.getId().toString(), GeocodeEntityType.AFTER_PARTY_LOCATION, afterPartyLocation);
  }
	
  private CompletableFuture<Void> sendMessage(String adminId, String id, GeocodeEntityType entityType, BaseAddress address) {
    CompletableFuture<Void> result = new CompletableFuture<>();
    LOGGER.info("Sending message to sqs-url {}", requestQueueUrl);
    
    try {
      SendMessageRequest request = newSendMessageRequest(adminId, id, entityType, address);
      queueProvider.sendMessage(request);
      result.complete(null);
    } catch (RuntimeException e) {
      LOGGER.error("Failed to send message for adminId {}, entityId {}, entityType {}", adminId, id, entityType, e);
      result.completeExceptionally(e);
    }
    return result;
	}

	SendMessageRequest newSendMessageRequest(String adminId, String id, GeocodeEntityType entityType, BaseAddress address) {

    Map<String, MessageAttributeValue> messageAttributes = Map.of(
    		"adminId", newStringAttribute(adminId),
    		"entityId", newStringAttribute(id),
    		"entityType", newStringAttribute(entityType.toString()),
    		"responseQueueUrl", newStringAttribute(this.responseQueueUrl)
		);
    String messageBody = mapToJson(address);

    return SendMessageRequest.builder()
            .queueUrl(this.requestQueueUrl)
            .messageAttributes(messageAttributes)
            .messageBody(messageBody)
            .build();
  }
  
	static MessageAttributeValue newStringAttribute(String value) {
		return MessageAttributeValue.builder().stringValue(value).dataType("String").build();
	}
  
  String mapToJson(BaseAddress obj) {
    try {
      return objectMapper.writeValueAsString( new GeocodeRequestBody(obj));
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }
}
