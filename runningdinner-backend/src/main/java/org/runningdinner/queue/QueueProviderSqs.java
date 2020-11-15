package org.runningdinner.queue;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageResult;

public class QueueProviderSqs implements QueueProvider {

  private AmazonSQS sqsClient;

  public QueueProviderSqs() {
    this.sqsClient = newSqsClient();
  }

  @Override
  public SendMessageResult sendMessage(SendMessageRequest messageRequest) {
    return sqsClient.sendMessage(messageRequest);
  }

  private static AmazonSQS newSqsClient() {
    return AmazonSQSClientBuilder.defaultClient();
  }
}
