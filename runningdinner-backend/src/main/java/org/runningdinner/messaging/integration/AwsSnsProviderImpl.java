package org.runningdinner.messaging.integration;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

public class AwsSnsProviderImpl implements SnsProvider {

  private final SnsClient snsClient;

  public AwsSnsProviderImpl() {
    snsClient = newSnsClient();
  }

  @Override
  public PublishResponse publish(PublishRequest request) {
    return snsClient.publish(request);
  }

  private static SnsClient newSnsClient() {
    return SnsClient.builder().region(Region.EU_CENTRAL_1).build();
  }
}
