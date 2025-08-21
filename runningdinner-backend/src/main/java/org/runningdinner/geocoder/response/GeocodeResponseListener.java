package org.runningdinner.geocoder.response;

import org.runningdinner.queue.QueueProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageResponse;

import java.util.Collections;
import java.util.List;

@Service
public class GeocodeResponseListener {

  private static final Logger LOGGER = LoggerFactory.getLogger(GeocodeResponseListener.class);

  private final String queueUrl;
  
  private final QueueProvider queueProvider;

	private final GeocodeResponseHandler geocodeResponseHandler;
	
  private final boolean schedulerEnabled;

  public GeocodeResponseListener(QueueProvider queueProvider,
  															 GeocodeResponseHandler geocodeResponseHandler,	
  														   @Value("${aws.sqs.geocode.response.url}") String queueUrl,
  														   @Value("${geocode.response.scheduler.enabled:true}") boolean schedulerEnabled) {
    this.queueProvider = queueProvider;
		this.geocodeResponseHandler = geocodeResponseHandler;
    this.queueUrl = queueUrl;
    this.schedulerEnabled = schedulerEnabled;
  }
  
  // Poll every minute (adjust as needed)
  @Scheduled(fixedDelay = 40 * 1000)
  public void triggerPollMessages() {
    if (!schedulerEnabled) {
      LOGGER.warn("triggerPollMessages scheduler is disabled!");
      return;
    }
    pollMessages();
  }
  

  public void pollMessages() {

    List<Message> messages = pollMessagesSafe(); 

    for (Message message : messages) {
      try {
        LOGGER.info("Received message: {} with headers {}", message.body(), message.messageAttributes());
        geocodeResponseHandler.processMessage(message);
        deleteMessage(message);
      } catch (Exception ex) {
        LOGGER.error("Error processing message: {}", message.body(), ex);
      }
    }
  }
  
  private List<Message> pollMessagesSafe() {
  	LOGGER.debug("Start polling of {}", queueUrl);
    try {
      ReceiveMessageRequest receiveRequest = ReceiveMessageRequest.builder()
          .queueUrl(queueUrl)
          .maxNumberOfMessages(10)
          .messageAttributeNames("All")
          .waitTimeSeconds(20)
          .build();

    	ReceiveMessageResponse response = queueProvider.receiveMessage(receiveRequest);
    	List<Message> result = response != null && response.hasMessages() ? response.messages() : Collections.emptyList();
    	LOGGER.debug("Finished polling of {}", queueUrl);
    	return result;
    } catch (Exception e) {
    	LOGGER.error("Error during polling of {}", queueUrl, e);
    	return Collections.emptyList();
    }
  }

  private void deleteMessage(Message message) {
    DeleteMessageRequest deleteRequest = DeleteMessageRequest.builder()
        .queueUrl(queueUrl)
        .receiptHandle(message.receiptHandle())
        .build();
    queueProvider.deleteMessage(deleteRequest);
    LOGGER.info("Deleted message with receipt handle: {}", message.receiptHandle());
  }
	
}
