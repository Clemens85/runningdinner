package org.runningdinner.queue;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.DeleteMessageResponse;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageResponse;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

@Service
@Primary
public class QueueProviderMockInMemory implements QueueProvider {

  private final List<SendMessageRequest> messageRequests = new CopyOnWriteArrayList<>();

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

	@Override
	public ReceiveMessageResponse receiveMessage(ReceiveMessageRequest receiveRequest) {
		if (messageRequests.isEmpty()) {
			return ReceiveMessageResponse.builder().build();
		}
		var msgRequest = messageRequests.getLast();
		Message message = Message.builder().messageAttributes(msgRequest.messageAttributes()).body(msgRequest.messageBody()).build();
		return ReceiveMessageResponse.builder().messages(message).build();
	}

	@Override
	public DeleteMessageResponse deleteMessage(DeleteMessageRequest deleteRequest) {
		if (!messageRequests.isEmpty()) {
			messageRequests.removeLast();
		}
		return null;
	}
}
