package org.runningdinner.queue;

import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageResult;

public interface QueueProvider {

  SendMessageResult sendMessage(SendMessageRequest messageRequest);
}
