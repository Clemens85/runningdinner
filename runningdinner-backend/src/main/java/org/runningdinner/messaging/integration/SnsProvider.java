package org.runningdinner.messaging.integration;

import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

public interface SnsProvider {
  PublishResponse publish(PublishRequest request);
}
