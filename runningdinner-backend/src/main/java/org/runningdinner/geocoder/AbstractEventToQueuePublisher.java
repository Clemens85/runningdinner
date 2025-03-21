package org.runningdinner.geocoder;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.queue.QueueProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.Map;
import java.util.concurrent.CompletableFuture;


public abstract class AbstractEventToQueuePublisher<T> {
  
  private static final Logger LOG = LoggerFactory.getLogger(AbstractEventToQueuePublisher.class);

  private final String queueUrl;

  private final GeocodeEventPublishConfig geocodeEventPublishConfig;

  protected AbstractEventToQueuePublisher(String queueUrl, GeocodeEventPublishConfig geocodeEventPublishConfig) {
    this.queueUrl = queueUrl;
		this.geocodeEventPublishConfig = geocodeEventPublishConfig;
	}

  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<Void> sendMessageToQueueAsync(T obj) {

    CompletableFuture<Void> result = new CompletableFuture<>();
    
    LOG.info("Sending message to sqs-url {}", queueUrl);
    try {
      SendMessageRequest messageRequest = newSendMessageRequest(obj);
      QueueProvider queueProvider = geocodeEventPublishConfig.getQueueProviderFactoryService().getQueueProvider();
      queueProvider.sendMessage(messageRequest);
      result.complete(null);
    } catch (RuntimeException e) {
      LOG.error("Failed to send message to sqs in {}", this.getClass(), e);
      result.completeExceptionally(e);
    }
    
    return result;
  }
  
  abstract protected Map<String, MessageAttributeValue> newMessageAttributes(T obj);
  
  abstract protected String newMessageBody(T obj);
  
  protected SendMessageRequest newSendMessageRequest(T obj) {

    Map<String, MessageAttributeValue> messageAttributes = newMessageAttributes(obj);
    String messageBody = newMessageBody(obj);

    return SendMessageRequest.builder()
            .queueUrl(queueUrl)
            .messageAttributes(messageAttributes)
            .messageBody(messageBody)
            .build();
  }

  protected String mapToJson(Object obj) {

    try {
      return geocodeEventPublishConfig.getObjectMapper().writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }

}
