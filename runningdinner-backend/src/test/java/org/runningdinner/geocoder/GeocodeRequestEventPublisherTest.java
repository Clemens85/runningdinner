package org.runningdinner.geocoder;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.queue.QueueProvider;
import org.runningdinner.queue.QueueProviderMockInMemory;
import org.runningdinner.queue.QueueTestHelper;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class GeocodeRequestEventPublisherTest {
	
  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private QueueProvider queueProviderFromAppContext;
  
  private RunningDinner runningDinner;

  private QueueProviderMockInMemory queueProvider;
  
  @BeforeEach
  public void setUp() {
  	this.queueProvider = (QueueProviderMockInMemory) queueProviderFromAppContext;
  	this.queueProvider.clearMessageRequests();
  }
  
  @Test
  public void geocodeEventIsPublishedOnCreate() {
  	
  	// No after party location -> No Event published so far
  	setUpRunningDinner(0);

  	Participant participant = ParticipantGenerator.generateParticipant(1);
    participant.setAddress(ParticipantAddress.parseFromString("MyStreet 1\n12345 MyCity"));
  	participant = testHelperService.addParticipant(participant, runningDinner);
  	
  	QueueTestHelper.newInstance(queueProvider).awaitQueueHasMessageSize(1);
  	List<SendMessageRequest> messageRequests = queueProvider.getMessageRequests();
  	SendMessageRequest messageRequest = messageRequests.getFirst();
  	assertMessageRequestForParticipant(messageRequest, participant.getId(), "MyStreet");
  }
  
  @Test
  public void geocodeEventIsPublishedOnUpdate() throws NoPossibleRunningDinnerException {
   
  	setUpRunningDinner(1);
  	
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    firstParticipant.getAddress().setStreet("New Street");
    
    queueProvider.clearMessageRequests();
    
    testHelperService.updateParticipant(firstParticipant);
  	QueueTestHelper.newInstance(queueProvider).awaitQueueHasMessageSize(1);

  	assertMessageRequestForParticipant(queueProvider.getMessageRequests().getFirst(), firstParticipant.getId(), "New Street");
  }
  
  private void setUpRunningDinner(int numParticipants) {
    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, numParticipants);
  }
  
  
  private void assertMessageRequestForParticipant(SendMessageRequest messageRequest, UUID participantId, String expectedStreet) {
  	assertThat(messageRequest.messageAttributes()).containsKey("adminId");
  	assertThat(messageRequest.messageAttributes()).containsKey("entityId");  	
  	assertThat(messageRequest.messageAttributes()).containsKey("entityType");
  	assertThat(messageRequest.messageAttributes()).containsKey("responseQueueUrl");
  	
  	assertThat(messageRequest.messageAttributes().get("adminId").stringValue()).isEqualTo(runningDinner.getAdminId());
  	assertThat(messageRequest.messageAttributes().get("entityId").stringValue()).isEqualTo(participantId.toString());
  	assertThat(messageRequest.messageAttributes().get("entityType").stringValue()).isEqualTo(GeocodeEntityType.PARTICIPANT.toString());
  	assertThat(messageRequest.messageAttributes().get("responseQueueUrl").stringValue()).isEqualTo("geocode-response-junit");
  	
  	String body = messageRequest.messageBody();
  	String expectedJson = """
  			{"street":"%s","streetNr":"1","cityName":"MyCity","zip":"12345"}
  			""".formatted(expectedStreet);
  	assertThat(body).isEqualToIgnoringWhitespace(expectedJson);
  }
  
}
