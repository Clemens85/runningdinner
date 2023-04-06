package org.runningdinner.geocoder;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.runningdinner.common.exception.TechnicalException;
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

@Service
public abstract class AbstractEventToQueuePublisher<T> {
  
  private static final Logger LOG = LoggerFactory.getLogger(AbstractEventToQueuePublisher.class);

  // @Value("${aws.sqs.geocode.url}")
  private String queueUrl;

  @Value("${host.context.url}")
  private String senderUrl;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private QueueProviderFactoryService queueProviderFactoryService;

  protected AbstractEventToQueuePublisher(String queueUrl) {
    this.queueUrl = queueUrl;
  }

  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  @Async
  public CompletableFuture<Void> sendMessageToQueueAsync(T obj) {

    CompletableFuture<Void> result = new CompletableFuture<>();
    
    LOG.info("Sending message to sqs-url {}", queueUrl);
    try {
      SendMessageRequest messageRequest = newSendMessageRequest(obj);
      QueueProvider queueProvider = queueProviderFactoryService.getQueueProvider();
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
    
    return new SendMessageRequest()
            .withQueueUrl(queueUrl)
            .withMessageAttributes(messageAttributes)
            .withMessageBody(messageBody);
  }

  protected String mapToJson(Object obj) {

    try {
      return objectMapper.writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }

  protected String getSenderUrl() {
    return senderUrl;
  }
  
  
}
