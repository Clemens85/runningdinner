package org.runningdinner.queue;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.awaitility.Awaitility;

public class QueueTestHelper {
	
  private static final long MAX_AWAIT_SECONDS = 4;
  
	private QueueProviderMockInMemory queueProvider;
	
  private QueueTestHelper(QueueProviderMockInMemory queueProvider) {
		this.queueProvider = queueProvider;
	}
  
  public static QueueTestHelper newInstance(QueueProviderMockInMemory queueProvider) {
  	return new QueueTestHelper(queueProvider);
  }

	public void awaitQueueHasMessageSize(int expectedMessageSize) {
    Awaitility
      .await()
      .atMost(MAX_AWAIT_SECONDS, TimeUnit.SECONDS)
      .until(queueProviderHasNumMessages(expectedMessageSize));
  }
  
  private Callable<Boolean> queueProviderHasNumMessages(int expectedMessageSize) {
    return () -> {
    	return queueProvider.getMessageRequests().size() >= expectedMessageSize;
		};
  }
  
	
	
}
