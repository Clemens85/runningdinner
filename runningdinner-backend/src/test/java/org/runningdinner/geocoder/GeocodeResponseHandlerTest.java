package org.runningdinner.geocoder;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.geocoder.GeocodingResult.GeocodingResultType;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.geocoder.response.GeocodeResponseListener;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.queue.QueueProvider;
import org.runningdinner.queue.QueueProviderMockInMemory;
import org.runningdinner.queue.QueueTestHelper;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class GeocodeResponseHandlerTest {
	
  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);
  
  @Autowired
  private IdGenerator idGenerator;
  
	@Autowired
	private GeocodeResponseListener listener;
	
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private QueueProvider queueProviderFromAppContext;
  
  private RunningDinner runningDinner;

  private QueueProviderMockInMemory queueProvider;
  
  private static final String GEOCODE_RESPONSE_JSON = """
				{
					"geocodingResult": {
						"lat": 2.5,
						"lng": 3.7,
						"resultType": "EXACT",
						"formatted_address": "foo"
					}
				}
  		""";
  
  @BeforeEach
  public void setUp() {
  	this.queueProvider = (QueueProviderMockInMemory) queueProviderFromAppContext;
  	this.queueProvider.clearMessageRequests();
  }
	
	@Test
	public void messageForNonExistentDinnerThrowsNoError() {
		queueProvider.sendMessage(newSendMessageRequest(idGenerator.generateAdminId(), UUID.randomUUID().toString(), GeocodeEntityType.AFTER_PARTY_LOCATION, GEOCODE_RESPONSE_JSON));
		listener.pollMessages();
		assertThat(true).isTrue();
	}

	@Test
	public void messageIsConsumedAndAppliedToParticipant() {
		
  	// No after party location -> No Event published so far
  	setUpRunningDinner(0);

  	Participant participant = ParticipantGenerator.generateParticipant(1);
  	participant = testHelperService.addParticipant(participant, runningDinner);
  	assertThat(participant.getGeocodingResult().getSyncStatus()).isEqualTo(GeocodingSyncStatus.UNSYNCHRONIZED);
  	
  	// Assert empty queue for now following test
  	QueueTestHelper.newInstance(queueProvider).awaitQueueHasMessageSize(1);
  	queueProvider.clearMessageRequests();
  	
  	// We hijack the SendMessageRequest and convert it internally in our test-queue provider to the specified response above, which simulates a sent response to our queue then:
  	queueProvider.sendMessage(newSendMessageRequest(runningDinner.getAdminId(), participant.getId().toString(), GeocodeEntityType.PARTICIPANT, GEOCODE_RESPONSE_JSON));
  	
		listener.pollMessages();

		participant = participantService.findParticipantById(runningDinner.getAdminId(), participant.getId());
		assertThat(participant.getGeocodingResult().getLat()).isEqualByComparingTo(2.5);
		assertThat(participant.getGeocodingResult().getLng()).isEqualByComparingTo(3.7);
		assertThat(participant.getGeocodingResult().getResultType()).isEqualTo(GeocodingResultType.EXACT);
  	assertThat(participant.getGeocodingResult().getSyncStatus()).isEqualTo(GeocodingSyncStatus.SYNCHRONIZED);
		
		assertThat(queueProvider.getMessageRequests()).isEmpty();
	}
	
	@Test
	public void messageWithoutBodyIsConsumedAndAppliedToParticipant() {
		
  	// No after party location -> No Event published so far
  	setUpRunningDinner(0);

  	Participant participant = ParticipantGenerator.generateParticipant(1);
  	participant = testHelperService.addParticipant(participant, runningDinner);
  	assertThat(participant.getGeocodingResult().getSyncStatus()).isEqualTo(GeocodingSyncStatus.UNSYNCHRONIZED);
  	
  	// Assert empty queue for now following test
  	QueueTestHelper.newInstance(queueProvider).awaitQueueHasMessageSize(1);
  	queueProvider.clearMessageRequests();
  	
  	// We hijack the SendMessageRequest and convert it internally in our test-queue provider to the specified response above, which simulates a sent response to our queue then:
  	queueProvider.sendMessage(newSendMessageRequest(runningDinner.getAdminId(), participant.getId().toString(), GeocodeEntityType.PARTICIPANT, null));
  	
		listener.pollMessages();

		participant = participantService.findParticipantById(runningDinner.getAdminId(), participant.getId());
		assertThat(participant.getGeocodingResult().getLat()).isEqualByComparingTo(-1d);
		assertThat(participant.getGeocodingResult().getLng()).isEqualByComparingTo(-1d);
		assertThat(participant.getGeocodingResult().getResultType()).isEqualTo(GeocodingResultType.NONE);
  	assertThat(participant.getGeocodingResult().getSyncStatus()).isEqualTo(GeocodingSyncStatus.UNSYNCHRONIZED);
		
		assertThat(queueProvider.getMessageRequests()).isEmpty();
	}
  
  private void setUpRunningDinner(int numParticipants) {
    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, numParticipants);
  }
  
	
	static SendMessageRequest newSendMessageRequest(String adminId, String id, GeocodeEntityType entityType, String messageBody) {

    Map<String, MessageAttributeValue> messageAttributes = Map.of(
    		"adminId", newStringAttribute(adminId),
    		"entityId", newStringAttribute(id),
    		"entityType", newStringAttribute(entityType.toString())
		);

    String queueUrl = "geocode-request-junit";
    if (StringUtils.isNotEmpty(queueUrl)) {
      return SendMessageRequest.builder()
          .queueUrl(queueUrl)
          .messageAttributes(messageAttributes)
          .messageBody(messageBody)
          .build();
    }
    return SendMessageRequest.builder()
        .queueUrl(queueUrl)
        .messageAttributes(messageAttributes)
        .build();
  }
	
	static MessageAttributeValue newStringAttribute(String value) {
		return MessageAttributeValue.builder().stringValue(value).dataType("String").build();
	}
}
