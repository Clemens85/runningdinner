package org.runningdinner.messaging.integration;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

import java.net.URI;

@Service
@Profile({"dev", "!test"})
public class LocalstackSnsProviderImpl implements SnsProvider {

  private final SnsClient snsClient;

  public LocalstackSnsProviderImpl() {
    snsClient = newLocalSnsClient("http://localhost:4566");
  }

  @Override
  public PublishResponse publish(PublishRequest request) {
    return snsClient.publish(request);
  }

  private SnsClient newLocalSnsClient(String endpoint) {
    return SnsClient
            .builder()
            .region(Region.EU_CENTRAL_1)
            .endpointOverride(URI.create(endpoint))
            .build();
  }
}
