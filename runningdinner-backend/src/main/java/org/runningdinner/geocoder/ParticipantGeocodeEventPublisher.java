package org.runningdinner.geocoder;

import java.util.Map;

import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.common.collect.ImmutableMap;

@Service
public class ParticipantGeocodeEventPublisher extends AbstractEventToQueuePublisher<Participant> {

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

}
