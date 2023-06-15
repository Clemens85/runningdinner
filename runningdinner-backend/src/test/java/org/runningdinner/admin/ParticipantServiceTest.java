
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.awaitility.Awaitility;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.ParticipantListActive;
import org.runningdinner.participant.rest.ParticipantWithListNumberTO;
import org.runningdinner.queue.QueueProviderFactoryService;
import org.runningdinner.queue.QueueProviderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.amazonaws.services.sqs.model.SendMessageRequest;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class ParticipantServiceTest {

  private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private TeamService teamService;

  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private QueueProviderFactoryService queueProviderFactoryService;

  private RunningDinner runningDinner;

  private QueueProviderMockInMemory queueProvider;

  @Before
  public void setUp() {

    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
    this.queueProvider = (QueueProviderMockInMemory) queueProviderFactoryService.getQueueProvider();
    this.queueProvider.clearMessageRequests();
  }

  @Test
  public void testGetParticipantsWithoutTeamAssignment() {

    ParticipantListActive participantList = participantService.findActiveParticipantList(runningDinner.getAdminId());
   
    assertParticipantListNumbers(participantList.getParticipants(), 1, 18);
    assertThat(participantList.getParticipants()).hasSize(18);
 
    assertThat(participantList.getParticipants())
    							.extracting("teamId")
    							.allMatch(t -> t == null);
    
    assertParticipantListNumbers(participantList.getParticipantsWaitingList(), 19, 22);
    assertThat(participantList.getParticipantsWaitingList()).hasSize(4);
    
    assertThat(participantList.getNumParticipantsTotal()).isEqualTo(TOTAL_NUMBER_OF_PARTICIPANTS);
    assertThat(participantList.getMissingParticipantsInfo().getNumParticipantsMissing()).isZero();
    assertThat(participantList.getMissingParticipantsInfo().getNumMinParticipantsNeeded()).isEqualTo(18);
  }

  @Test
  public void testGetParticipantsWithTeamAssignment() {

    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

    ParticipantListActive participantList = participantService.findActiveParticipantList(runningDinner.getAdminId());
    
    assertParticipantListNumbers(participantList.getParticipants(), 1, 18);
    assertThat(participantList.getParticipants()).hasSize(18);
    
    assertThat(participantList.getParticipants())
    	.extracting("teamId")
    	.allMatch(t -> t != null);
  
    assertParticipantListNumbers(participantList.getParticipantsWaitingList(), 19, 22);
    assertThat(participantList.getParticipantsWaitingList()).hasSize(4);
    
    assertThat(participantList.getNumParticipantsTotal()).isEqualTo(TOTAL_NUMBER_OF_PARTICIPANTS);
    assertThat(participantList.getMissingParticipantsInfo().getNumParticipantsMissing()).isZero();
    assertThat(participantList.getMissingParticipantsInfo().getNumMinParticipantsNeeded()).isEqualTo(18);
  }
  
  @Test(expected = ValidationException.class)
  public void updateWithAlreadyUsedEmailAddressNotPossible() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    Participant secondParticipant = participants.get(1);
    
    firstParticipant.setEmail(secondParticipant.getEmail()); // Duplicated Email
    testHelperService.updateParticipant(firstParticipant);
  }
  
  @Test
  public void standardUpdateParticipant() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    firstParticipant.setAge(25);
    Participant result = testHelperService.updateParticipant(firstParticipant);
    assertThat(result.getAge()).isEqualTo(25);
  }
  
  @Test
  public void geocodeEventIsPublishedOnUpdate() throws NoPossibleRunningDinnerException {
   
    // Create teams for verifying that lazy loading of team in participant does not throw error
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    
    firstParticipant.getAddress().setStreet("New Street");
    testHelperService.updateParticipant(firstParticipant);
    
    Awaitility
      .await()
      .atMost(3, TimeUnit.SECONDS)
      .untilAsserted(() -> assertThat(queueProvider.getMessageRequests()).isNotEmpty());

    List<Map<String, MessageAttributeValue>> allSentMessageEntries = queueProvider
                                                                      .getMessageRequests()
                                                                      .stream().map(SendMessageRequest::getMessageAttributes)
                                                                      .collect(Collectors.toList());
    
    Set<String> participantIdsInMessageEntries = allSentMessageEntries
                                                  .stream()
                                                  .map(entry -> entry.get("participantId"))
                                                  .filter(Objects::nonNull)
                                                  .map(MessageAttributeValue::getStringValue)
                                                  .collect(Collectors.toSet());
    
    assertThat(participantIdsInMessageEntries).contains(firstParticipant.getId().toString());
  }

  private void assertParticipantListNumbers(List<ParticipantWithListNumberTO> resultList, int expectedStartNumber, int expectedEndNumber) {

    List<Integer> expectedParticipantNumbers = IntStream.rangeClosed(expectedStartNumber, expectedEndNumber).boxed().collect(Collectors.toList());
    assertThat(resultList).extracting("participantNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);
    assertThat(resultList).extracting("listNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);

    
  }


}
