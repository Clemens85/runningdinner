package org.runningdinner.queue;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

public class QueueProviderSqs implements QueueProvider {

  private final SqsClient sqsClient;

  public QueueProviderSqs() {
    this.sqsClient = newSqsClient();
  }

  @Override
  public SendMessageResponse sendMessage(SendMessageRequest messageRequest) {
    return sqsClient.sendMessage(messageRequest);
  }

  private static SqsClient newSqsClient() {
    return SqsClient.builder().region(Region.EU_CENTRAL_1).build();
  }
}
