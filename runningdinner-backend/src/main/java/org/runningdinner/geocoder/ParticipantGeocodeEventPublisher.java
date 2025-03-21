package org.runningdinner.geocoder;

import com.google.common.collect.ImmutableMap;
import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;

import java.util.Map;

@Service
public class ParticipantGeocodeEventPublisher extends AbstractEventToQueuePublisher<Participant> {

  private final String senderUrl;

  public ParticipantGeocodeEventPublisher(@Value("${aws.sqs.geocode.url}") String queueUrl,
                                          GeocodeEventPublishConfig geocodeEventPublishConfig) {
    super(queueUrl, geocodeEventPublishConfig);
    this.senderUrl = geocodeEventPublishConfig.getSenderUrl();
  }

  @Override
  protected Map<String, MessageAttributeValue> newMessageAttributes(Participant participant) {
    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
        .put("participantId", MessageAttributeValue.builder().stringValue(participant.getId().toString()).dataType("String").build())
        .put("adminId", MessageAttributeValue.builder().stringValue(participant.getAdminId()).dataType("String").build())
        .put("senderUrl", MessageAttributeValue.builder().stringValue(senderUrl).dataType("String").build())
        .build();
    return messageAttributes;
  }

  @Override
  protected String newMessageBody(Participant obj) {
    return mapToJson(obj);
  }

}
