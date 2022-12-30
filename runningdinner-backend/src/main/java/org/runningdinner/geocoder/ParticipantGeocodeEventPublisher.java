package org.runningdinner.geocoder;

import java.util.Map;

import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.common.collect.ImmutableMap;

@Service
public class ParticipantGeocodeEventPublisher extends AbstractEventToQueuePublisher<Participant> {

//  private static final Logger LOG = LoggerFactory.getLogger(ParticipantGeocodeEventPublisher.class);

  protected ParticipantGeocodeEventPublisher(@Value("${aws.sqs.geocode.url}") String queueUrl) {
    super(queueUrl);
  }

  @Override
  protected Map<String, MessageAttributeValue> newMessageAttributes(Participant participant) {
    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
        .put("participantId", new MessageAttributeValue().withStringValue(participant.getId().toString()).withDataType("String"))
        .put("adminId", new MessageAttributeValue().withStringValue(participant.getAdminId()).withDataType("String"))
        .put("senderUrl", new MessageAttributeValue().withStringValue(getSenderUrl()).withDataType("String"))
        .build();
    return messageAttributes;
  }

  @Override
  protected String newMessageBody(Participant obj) {
    return mapToJson(obj);
  }
  
  
  
//  @Value("${aws.sqs.geocode.url}")
//  private String queueUrl;

//  @Value("${host.context.url}")
//  private String senderUrl;
//
//  @Autowired
//  private ObjectMapper objectMapper;
//
//  @Autowired
//  private QueueProviderFactoryService queueProviderFactoryService;
//
//  @Transactional(propagation = Propagation.NOT_SUPPORTED)
//  @Async
//  public CompletableFuture<Void> sendMessageToQueueAsync(Participant participant) {
//
//    CompletableFuture<Void> result = new CompletableFuture<>();
//    
//    LOG.info("Sending message to sqs-url {}", queueUrl);
//    try {
//      SendMessageRequest messageRequest = newSendMessageRequest(participant);
//      QueueProvider queueProvider = queueProviderFactoryService.getQueueProvider();
//      queueProvider.sendMessage(messageRequest);
//      result.complete(null);
//    } catch (RuntimeException e) {
//      LOG.error("Failed to send message to sqs", e);
//      result.completeExceptionally(e);
//    }
//    
//    return result;
//  }
//
//  private SendMessageRequest newSendMessageRequest(Participant participant) {
//
//    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
//            .put("participantId", new MessageAttributeValue().withStringValue(participant.getId().toString()).withDataType("String"))
//            .put("adminId", new MessageAttributeValue().withStringValue(participant.getAdminId()).withDataType("String"))
//            .put("senderUrl", new MessageAttributeValue().withStringValue(senderUrl).withDataType("String"))
//            .build();
//
//    return new SendMessageRequest()
//            .withQueueUrl(queueUrl)
//            .withMessageAttributes(messageAttributes)
//            .withMessageBody(mapToJson(participant));
//  }
//
//  private String mapToJson(Participant participant) {
//
//    try {
//      return objectMapper.writeValueAsString(participant);
//    } catch (JsonProcessingException e) {
//      throw new TechnicalException(e);
//    }
//  }

}
