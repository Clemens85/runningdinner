package org.runningdinner.queue;

import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

public interface QueueProvider {

  SendMessageResponse sendMessage(SendMessageRequest messageRequest);
}
