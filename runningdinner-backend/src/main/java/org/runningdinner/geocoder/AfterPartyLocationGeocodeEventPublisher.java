package org.runningdinner.geocoder;

import java.util.Map;

import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.common.collect.ImmutableMap;

@Service
public class AfterPartyLocationGeocodeEventPublisher extends AbstractEventToQueuePublisher<RunningDinner> {
  
  protected AfterPartyLocationGeocodeEventPublisher(@Value("${aws.sqs.afterpartylocation.url}") String queueUrl) {
    super(queueUrl);
  }

  @Override
  protected Map<String, MessageAttributeValue> newMessageAttributes(RunningDinner runningDinner) {
    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
        .put("adminId", new MessageAttributeValue().withStringValue(runningDinner.getAdminId()).withDataType("String"))
        .put("senderUrl", new MessageAttributeValue().withStringValue(getSenderUrl()).withDataType("String"))
        .build();
    return messageAttributes;
  }

  @Override
  protected String newMessageBody(RunningDinner obj) {
    return mapToJson(obj);
  }

}
