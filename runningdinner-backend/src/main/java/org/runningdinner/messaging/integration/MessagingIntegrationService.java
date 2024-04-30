package org.runningdinner.messaging.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.sns.model.MessageAttributeValue;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class MessagingIntegrationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessagingIntegrationService.class);

  private final String snsTopicArn;

  private final ObjectMapper objectMapper;

  private final SnsProvider snsProvider;

  private final UrlGenerator urlGenerator;

  public MessagingIntegrationService(@Value("${aws.sns.messaging-integration.arn}") String snsTopicArn, ObjectMapper objectMapper, SnsProvider snsProvider, UrlGenerator urlGenerator) {
    this.snsTopicArn = snsTopicArn;
    this.objectMapper = objectMapper;
    this.snsProvider = snsProvider;
    this.urlGenerator = urlGenerator;
  }

  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<PublishResponse> handleNewOrUpdatedRunningDinner(RunningDinner runningDinner) {

    RunningDinner runningDinnerWithPublicUrl = urlGenerator.addPublicDinnerUrl(runningDinner);
    RunningDinnerIntegrationPayload payloadObj = new RunningDinnerIntegrationPayload(runningDinnerWithPublicUrl);

    String payloadStr = toJsonString(payloadObj);

    PublishRequest request = PublishRequest
      .builder()
      .topicArn(snsTopicArn)
      .message(payloadStr)
      .messageAttributes(newMessageAttributes(MessagingIntegrationEventType.RUNNING_DINNER_CHANGED))
      .build();

    return publish(request, payloadStr);
  }

  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<PublishResponse> handleParticipantSaved(Participant participant, RunningDinner runningDinner) {

    ParticipantIntegrationPayload payloadObj = new ParticipantIntegrationPayload(participant, runningDinner.getPublicSettings().getPublicId());

    String payloadStr = toJsonString(payloadObj);

    PublishRequest request = PublishRequest
      .builder()
      .topicArn(snsTopicArn)
      .message(payloadStr)
      .messageAttributes(newMessageAttributes(MessagingIntegrationEventType.PARTICIPANT_CHANGED))
      .build();

    return publish(request, payloadStr);
  }

  private CompletableFuture<PublishResponse> publish(PublishRequest request, String payloadStr) {
    CompletableFuture<PublishResponse> result = new CompletableFuture<>();
    try {
      PublishResponse publishResult = snsProvider.publish(request);
      LOGGER.info("Published message for {} successfully to SNS topic {} with message-id {}", payloadStr, snsTopicArn, publishResult.messageId());
      result.complete(publishResult);
    } catch (Exception e) {
      LOGGER.error("Failure when publishing {} to SNS topic {}", payloadStr, snsTopicArn, e);
      result.completeExceptionally(e);
    }
    return result;
  }

  private String toJsonString(Object payloadObj) {
    try {
      return objectMapper.writeValueAsString(payloadObj);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  protected Map<String, MessageAttributeValue> newMessageAttributes(MessagingIntegrationEventType eventType) {
    return Map.of("EventType", MessageAttributeValue
                                    .builder()
                                    .dataType("String")
                                    .stringValue(eventType.toString())
                                    .build());
  }


}
