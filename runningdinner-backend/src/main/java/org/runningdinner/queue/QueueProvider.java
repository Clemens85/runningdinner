package org.runningdinner.queue;

import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.DeleteMessageResponse;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageResponse;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

public interface QueueProvider {

  SendMessageResponse sendMessage(SendMessageRequest messageRequest);
  
  ReceiveMessageResponse receiveMessage(ReceiveMessageRequest receiveRequest);
  
  DeleteMessageResponse deleteMessage( DeleteMessageRequest deleteRequest);
}
