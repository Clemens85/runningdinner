package org.runningdinner.queue;

import java.util.ArrayList;
import java.util.List;

import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageResult;

public class QueueProviderMockInMemory implements QueueProvider {

  private List<SendMessageRequest> messageRequests = new ArrayList<>();

  @Override
  public SendMessageResult sendMessage(SendMessageRequest messageRequest) {
    messageRequests.add(messageRequest);
    return new SendMessageResult();
  }

  public List<SendMessageRequest> getMessageRequests() {

    return messageRequests;
  }

  public void clearMessageRequests() {

    this.messageRequests.clear();
  }
}
