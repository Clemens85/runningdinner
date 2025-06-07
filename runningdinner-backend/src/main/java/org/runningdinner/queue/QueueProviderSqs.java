package org.runningdinner.queue;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.util.EnvUtilService;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.DeleteMessageResponse;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageResponse;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

@Service
public class QueueProviderSqs implements QueueProvider {

  private SqsClient sqsClient;
	
  /**
   * Only used during local development
   */
	private final String awsProfile;
  
  public QueueProviderSqs(EnvUtilService envUtilService) {
  	this.awsProfile = envUtilService.getConfigProperty("aws.profile");
  }

  @Override
  public SendMessageResponse sendMessage(SendMessageRequest messageRequest) {
    return sqsClient.sendMessage(messageRequest);
  }

  @PostConstruct
  protected void init() {
  	this.sqsClient = newSqsClient();
  }
  
  private SqsClient newSqsClient() {
  	if (StringUtils.isNotEmpty(awsProfile)) {
  		System.setProperty("aws.profile", awsProfile);
  	}
    return SqsClient.builder().region(Region.EU_CENTRAL_1).build();
  }

	@Override
	public ReceiveMessageResponse receiveMessage(ReceiveMessageRequest receiveRequest) {
		return sqsClient.receiveMessage(receiveRequest);
	}

	@Override
	public DeleteMessageResponse deleteMessage(DeleteMessageRequest deleteRequest) {
		return sqsClient.deleteMessage(deleteRequest);
	}
}
