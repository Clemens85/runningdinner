package org.runningdinner.queue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.ListQueuesResult;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageResult;

public class QueueProviderDev implements QueueProvider {

  private static final Logger LOG = LoggerFactory.getLogger(QueueProviderDev.class);

  private AmazonSQS localSqsClient;

  public QueueProviderDev() {
    localSqsClient = newLocalSqsClient();
  }

  @Override
  public SendMessageResult sendMessage(SendMessageRequest messageRequest) {

    String localSqsUrl = getLocalSqsUrl();
    LOG.info("Using local SQS URL {}", localSqsUrl);
    messageRequest.setQueueUrl(localSqsUrl);
    return localSqsClient.sendMessage(messageRequest);
  }

  private String getLocalSqsUrl() {

    ListQueuesResult listQueuesResult = localSqsClient.listQueues();
    for (String queueUrl : listQueuesResult.getQueueUrls()) {
      if (queueUrl.endsWith("geocode")) {
        return queueUrl;
      }
    }
    throw new IllegalStateException("Could not find local geocode sqs queue");
  }

  private AmazonSQS newLocalSqsClient() {

    String endpoint = "http://localhost:9324";
    String region = "eu-central-1";
    String accessKey = "x";
    String secretKey = "x";
    return AmazonSQSClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
            .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, region))
            .build();
  }
}

//  private String localHttpServer = "http://localhost:3000";
//  private String geocodecodeRelativeUrl = "/geocode/ADMIN_ID/participants/PARTICIPANT_ID";

//  @Override
//  public SendMessageResult sendMessage(SendMessageRequest messageRequest) {
//
//    Map<String, MessageAttributeValue> messageAttributes = messageRequest.getMessageAttributes();
//    String adminId = messageAttributes.get("adminId").getStringValue();
//    String participantId = messageAttributes.get("participantId").getStringValue();
//
//    String url = localHttpServer;
//    url += geocodecodeRelativeUrl
//             .replaceAll("ADMIN_ID", adminId)
//             .replaceAll("PARTICIPANT_ID", participantId);
//
//    LOGGER.info("Overwriting configured SQS URL with local HTTP URL: {}", url);
//
//    try {
//      restTemplate.getForEntity(new URI(url), ParticipantTO.class);
//    } catch (URISyntaxException e) {
//      throw new TechnicalException(e);
//    }
//
//  }
