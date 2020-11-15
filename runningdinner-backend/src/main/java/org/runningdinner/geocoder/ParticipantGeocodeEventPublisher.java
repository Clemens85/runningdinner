package org.runningdinner.geocoder;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.participant.Participant;
import org.runningdinner.queue.QueueProvider;
import org.runningdinner.queue.QueueProviderFactoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableMap;

@Service
public class ParticipantGeocodeEventPublisher {

  private static final Logger LOG = LoggerFactory.getLogger(ParticipantGeocodeEventPublisher.class);

  @Value("${aws.sqs.geocode.url}")
  private String queueUrl;

  @Value("${host.context.url}")
  private String senderUrl;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private QueueProviderFactoryService queueProviderFactoryService;

  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<Void> sendMessageToQueueAsync(Participant participant) {

    CompletableFuture<Void> result = new CompletableFuture<>();
    
    LOG.info("Sending message to sqs-url {}", queueUrl);
    try {
      SendMessageRequest messageRequest = newSendMessageRequest(participant);
      QueueProvider queueProvider = queueProviderFactoryService.getQueueProvider();
      queueProvider.sendMessage(messageRequest);
      result.complete(null);
    } catch (RuntimeException e) {
      LOG.error("Failed to send message to sqs", e);
      result.completeExceptionally(e);
    }
    
    return result;
  }

  private SendMessageRequest newSendMessageRequest(Participant participant) {

    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
            .put("participantId", new MessageAttributeValue().withStringValue(participant.getId().toString()).withDataType("String"))
            .put("adminId", new MessageAttributeValue().withStringValue(participant.getAdminId()).withDataType("String"))
            .put("senderUrl", new MessageAttributeValue().withStringValue(senderUrl).withDataType("String"))
            .build();

    return new SendMessageRequest()
            .withQueueUrl(queueUrl)
            .withMessageAttributes(messageAttributes)
            .withMessageBody(mapToJson(participant));
  }

  private String mapToJson(Participant participant) {

    try {
      return objectMapper.writeValueAsString(participant);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }

}
