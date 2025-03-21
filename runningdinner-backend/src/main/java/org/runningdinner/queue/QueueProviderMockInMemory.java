package org.runningdinner.queue;

import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.util.ArrayList;
import java.util.List;

public class QueueProviderMockInMemory implements QueueProvider {

  private final List<SendMessageRequest> messageRequests = new ArrayList<>();

  @Override
  public SendMessageResponse sendMessage(SendMessageRequest messageRequest) {
    messageRequests.add(messageRequest);
    return SendMessageResponse.builder().build();
  }

  public List<SendMessageRequest> getMessageRequests() {
    return messageRequests;
  }

  public void clearMessageRequests() {
    this.messageRequests.clear();
  }
}
