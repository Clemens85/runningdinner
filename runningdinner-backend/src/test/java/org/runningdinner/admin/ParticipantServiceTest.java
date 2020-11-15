
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
import org.runningdinner.participant.AssignmentType;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.queue.QueueProviderFactoryService;
import org.runningdinner.queue.QueueProviderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.amazonaws.services.sqs.model.MessageAttributeValue;

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
  public void setUp() throws NoPossibleRunningDinnerException {

    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
    this.queueProvider = (QueueProviderMockInMemory) queueProviderFactoryService.getQueueProvider();
    this.queueProvider.clearMessageRequests();
  }

  @Test
  public void testGetParticipantsWithoutTeamAssignment() {

    List<Participant> resultList = participantService.findActiveParticipantsWithAssignableInfo(runningDinner.getAdminId());
    assertParticipantListSizeAndNumbers(resultList, TOTAL_NUMBER_OF_PARTICIPANTS);
    
    assertThat(resultList)
      .filteredOn(p -> p.getParticipantNumber() <= 18)
      .extracting("assignmentType", AssignmentType.class)
      .allMatch(a -> a == AssignmentType.ASSIGNABLE);
    
    assertThat(resultList).extracting("teamId").allMatch(t -> t == null);
    
    assertThat(resultList)
      .filteredOn(p -> p.getParticipantNumber() > 18)
      .extracting("assignmentType", AssignmentType.class)
      .allMatch(a -> a == AssignmentType.NOT_ASSIGNABLE);
  }

  @Test
  public void testGetParticipantsWithTeamAssignment()
    throws NoPossibleRunningDinnerException {

    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

    List<Participant> resultList = participantService.findActiveParticipantsWithAssignableInfo(runningDinner.getAdminId());
    assertParticipantListSizeAndNumbers(resultList, TOTAL_NUMBER_OF_PARTICIPANTS);

    assertThat(resultList)
      .filteredOn(p -> p.getParticipantNumber() <= 18)
      .extracting("assignmentType", AssignmentType.class)
      .allMatch(a -> a == AssignmentType.ASSIGNED_TO_TEAM);
    
    assertThat(resultList).filteredOn(p -> p.getParticipantNumber() <= 18).extracting("teamId").allMatch(t -> t != null);
  
    assertThat(resultList)
    .filteredOn(p -> p.getParticipantNumber() > 18)
    .extracting("assignmentType", AssignmentType.class)
    .allMatch(a -> a == AssignmentType.NOT_ASSIGNABLE);

  }
  
  @Test(expected = ValidationException.class)
  public void updateWithAlreadyUsedEmailAddressNotPossible() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    Participant secondParticipant = participants.get(1);
    
    firstParticipant.setEmail(secondParticipant.getEmail()); // Duplicated Email
    participantService.updateParticipant(runningDinner.getAdminId(), firstParticipant.getId(), firstParticipant);
  }
  
  @Test
  public void standardUpdateParticipant() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    firstParticipant.setAge(25);
    Participant result = participantService.updateParticipant(runningDinner.getAdminId(), firstParticipant.getId(), firstParticipant);
    assertThat(result.getAge()).isEqualTo(25);
  }
  
  @Test
  public void geocodeEventIsPublishedOnUpdate() throws NoPossibleRunningDinnerException {
   
    // Create teams for verifying that lazy loading of team in participant does not throw error
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    
    assertThat(queueProvider.getMessageRequests()).isEmpty();
    
    firstParticipant.getAddress().setStreet("New Street");
    participantService.updateParticipant(runningDinner.getAdminId(), firstParticipant.getId(), firstParticipant);
    
    Awaitility
      .await()
      .atMost(3, TimeUnit.SECONDS)
      .untilAsserted(() ->  assertThat(queueProvider.getMessageRequests()).hasSize(1));

    Map<String, MessageAttributeValue> messageAttributes = queueProvider.getMessageRequests().get(0).getMessageAttributes();
    assertThat(messageAttributes.get("participantId").getStringValue()).isEqualTo(firstParticipant.getId().toString());
  }

  private void assertParticipantListSizeAndNumbers(List<Participant> resultList, int expectedTotalNumberOfParticipants) {

    assertThat(resultList).hasSize(expectedTotalNumberOfParticipants);

    List<Integer> expectedParticipantNumbers = IntStream.rangeClosed(1, expectedTotalNumberOfParticipants).boxed().collect(Collectors.toList());
    assertThat(resultList).extracting("participantNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);
  }


}
