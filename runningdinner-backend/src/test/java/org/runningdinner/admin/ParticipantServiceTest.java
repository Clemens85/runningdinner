
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
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
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfo;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfoList;
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

  @Test
  public void findParticipantRegistrationsAllActivated() {
    
    // We register 22 participants in setup and our page-size is 18
    
    ParticipantRegistrationInfoList latestRegistrations = participantService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);
    
    assertThat(latestRegistrations.getRegistrations()).hasSize(ActivityService.PARTICIPANT_ACTIVITES_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();
    assertThat(latestRegistrations.getNotActivatedRegistrationsTooOld()).isEmpty();
    
    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    for (int i = 0; i < ActivityService.PARTICIPANT_ACTIVITES_PAGE_SIZE;  i++) {
      assertThat(registrations.get(i).getParticipantNumber()).isEqualTo(22 - i); // 22, 21, 20, ... (because we get latest registrations)
    }
  }
  
  @Test
  public void findParticipantRegistrationsSomeNotActivated() {
    
    List<Participant> allParticipants = participantService.findParticipants(runningDinner.getAdminId(), false);
    
    // We register 22 participants in setup and our page-size is 18
    
    Participant secondToLastRegistratedParticipant = removeActivation(allParticipants.get(20));
    Participant oldRegisteredParticipant = removeActivation(allParticipants.get(1));
    
    ParticipantRegistrationInfoList latestRegistrations = participantService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 0);
    
    assertThat(latestRegistrations.getRegistrations()).hasSize(ActivityService.PARTICIPANT_ACTIVITES_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();
    
    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(secondToLastRegistratedParticipant.getParticipantNumber());
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(oldRegisteredParticipant.getParticipantNumber());
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(22);
    assertThat(registrations.get(3).getParticipantNumber()).isEqualTo(20);
    assertThat(registrations.get(4).getParticipantNumber()).isEqualTo(19);
    assertThat(registrations.get(5).getParticipantNumber()).isEqualTo(18);
    // ... And so on
    
    assertThat(latestRegistrations.getNotActivatedRegistrationsTooOld()).isEmpty();
    
    latestRegistrations = participantService.findParticipantRegistrations(runningDinner.getAdminId(), LocalDateTime.now(), 1);
    assertThat(latestRegistrations.getRegistrations()).hasSize(4);
    assertThat(latestRegistrations.isHasMore()).isFalse();
    
    // The one with number 2 was already in first page, so it should not occur here
    registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(5);
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(4);
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(3);
    assertThat(registrations.get(3).getParticipantNumber()).isEqualTo(1);
  }
  
  
  @Test
  public void findParticipantRegistrationsSomeNotActivatedSinceSeveralDays() {
    
    List<Participant> allParticipants = participantService.findParticipants(runningDinner.getAdminId(), false);
    
    // We register 22 participants in setup and our page-size is 18
    
    Participant secondToLastRegistratedParticipant = removeActivation(allParticipants.get(20));
    Participant oldRegisteredParticipant = removeActivation(allParticipants.get(1));
    
    LocalDateTime now = LocalDateTime.now().plusDays(3);
    
    ParticipantRegistrationInfoList latestRegistrations = participantService.findParticipantRegistrations(runningDinner.getAdminId(), now, 0);
    assertThat(latestRegistrations.getRegistrations()).hasSize(ActivityService.PARTICIPANT_ACTIVITES_PAGE_SIZE);
    assertThat(latestRegistrations.isHasMore()).isTrue();
    
    List<ParticipantRegistrationInfo> registrations = latestRegistrations.getRegistrations();
    assertThat(registrations.get(0).getParticipantNumber()).isEqualTo(secondToLastRegistratedParticipant.getParticipantNumber());
    assertThat(registrations.get(1).getParticipantNumber()).isEqualTo(oldRegisteredParticipant.getParticipantNumber());
    assertThat(registrations.get(2).getParticipantNumber()).isEqualTo(22);
    // ... and so on
    
    List<ParticipantRegistrationInfo> registrationsTooOld = latestRegistrations.getNotActivatedRegistrationsTooOld();
    assertThat(registrationsTooOld).hasSize(2);
    // Test also here that projection is properly mapped:
    ParticipantRegistrationInfo oldRegisteredParticipantInfo = registrationsTooOld.get(1);
    assertThat(oldRegisteredParticipantInfo.getId()).isEqualTo(oldRegisteredParticipant.getId());
    assertThat(oldRegisteredParticipantInfo.getEmail()).isEqualTo(oldRegisteredParticipant.getEmail());
    assertThat(oldRegisteredParticipantInfo.getActivationDate()).isNull();
    assertThat(oldRegisteredParticipantInfo.getCreatedAt()).isEqualTo(oldRegisteredParticipant.getCreatedAt());
    assertThat(oldRegisteredParticipantInfo.getFirstnamePart()).isEqualTo(oldRegisteredParticipant.getName().getFirstnamePart());
    assertThat(oldRegisteredParticipantInfo.getLastname()).isEqualTo(oldRegisteredParticipant.getName().getLastname());
    assertThat(oldRegisteredParticipantInfo.getMobileNumber()).isEqualTo(oldRegisteredParticipant.getMobileNumber());
    assertThat(oldRegisteredParticipantInfo.getParticipantNumber()).isEqualTo(2);
  }
  
  private Participant removeActivation(Participant participant) {
    participant.setActivationDate(null);
    participant.setActivatedBy(null);
    List<Participant> result = testHelperService.saveParticipants(Collections.singletonList(participant));
    return result.get(0);
  }
  
  private void assertParticipantListNumbers(List<ParticipantWithListNumberTO> resultList, int expectedStartNumber, int expectedEndNumber) {

    List<Integer> expectedParticipantNumbers = IntStream.rangeClosed(expectedStartNumber, expectedEndNumber).boxed().collect(Collectors.toList());
    assertThat(resultList).extracting("participantNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);
    assertThat(resultList).extracting("listNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);

    
  }


}
