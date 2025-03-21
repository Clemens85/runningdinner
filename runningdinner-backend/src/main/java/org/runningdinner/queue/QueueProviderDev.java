package org.runningdinner.queue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.ListQueuesResponse;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.net.URI;

public class QueueProviderDev implements QueueProvider {

  private static final Logger LOG = LoggerFactory.getLogger(QueueProviderDev.class);

  private final SqsClient localSqsClient;

  public QueueProviderDev(String endpoint) {
    this.localSqsClient = newLocalSqsClient(endpoint);
  }

  @Override
  public SendMessageResponse sendMessage(SendMessageRequest messageRequest) {
    String localSqsUrl = getLocalSqsUrl();
    LOG.info("Using local SQS URL {}", localSqsUrl);
    SendMessageRequest newRequest = messageRequest.toBuilder().queueUrl(localSqsUrl).build();
    return localSqsClient.sendMessage(newRequest);
  }

  private String getLocalSqsUrl() {

    ListQueuesResponse listQueuesResult = localSqsClient.listQueues();
    for (String queueUrl : listQueuesResult.queueUrls()) {
      if (queueUrl.endsWith("geocode")) {
        return queueUrl;
      }
    }
    throw new IllegalStateException("Could not find local geocode sqs queue");
  }

  private SqsClient newLocalSqsClient(String endpoint) {
//    System.setProperty("aws.endpointUrlSqs", endpoint);
    String region = "eu-central-1";
    String accessKey = "x";
    String secretKey = "x";
    return SqsClient.builder()
            .region(Region.of(region))
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
            .build();
  }
}
