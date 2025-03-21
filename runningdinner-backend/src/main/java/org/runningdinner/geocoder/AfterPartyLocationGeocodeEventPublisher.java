package org.runningdinner.geocoder;

import com.google.common.collect.ImmutableMap;
import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;

import java.util.Map;

@Service
public class AfterPartyLocationGeocodeEventPublisher extends AbstractEventToQueuePublisher<RunningDinner> {

  private final String senderUrl;

  public AfterPartyLocationGeocodeEventPublisher(@Value("${aws.sqs.afterpartylocation.url}") String queueUrl,
                                                 GeocodeEventPublishConfig geocodeEventPublishConfig) {
    super(queueUrl, geocodeEventPublishConfig);
    this.senderUrl = geocodeEventPublishConfig.getSenderUrl();
	}

  @Override
  protected Map<String, MessageAttributeValue> newMessageAttributes(RunningDinner runningDinner) {
    Map<String, MessageAttributeValue> messageAttributes = ImmutableMap.<String, MessageAttributeValue> builder()
        .put("adminId", MessageAttributeValue.builder().stringValue(runningDinner.getAdminId()).dataType("String").build())
        .put("senderUrl", MessageAttributeValue.builder().stringValue(senderUrl).dataType("String").build())
        .build();
    return messageAttributes;
  }

  @Override
  protected String newMessageBody(RunningDinner obj) {
    return mapToJson(obj);
  }

}
