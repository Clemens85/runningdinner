
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.ParticipantListActive;
import org.runningdinner.participant.rest.ParticipantWithListNumberTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
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
  
  private RunningDinner runningDinner;

  @BeforeEach
  public void setUp() {

    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
  }

  @Test
  public void testGetParticipantsWithoutTeamAssignment() {

    ParticipantListActive participantList = participantService.findActiveParticipantList(runningDinner.getAdminId());
   
    assertParticipantListNumbers(participantList.getParticipants(), 1, 18);
    assertThat(participantList.getParticipants()).hasSize(18);
 
    assertThat(participantList.getParticipants())
    							.extracting("teamId")
    							.allMatch(Objects::isNull);
    
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
    	.allMatch(Objects::nonNull);
  
    assertParticipantListNumbers(participantList.getParticipantsWaitingList(), 19, 22);
    assertThat(participantList.getParticipantsWaitingList()).hasSize(4);
    
    assertThat(participantList.getNumParticipantsTotal()).isEqualTo(TOTAL_NUMBER_OF_PARTICIPANTS);
    assertThat(participantList.getMissingParticipantsInfo().getNumParticipantsMissing()).isZero();
    assertThat(participantList.getMissingParticipantsInfo().getNumMinParticipantsNeeded()).isEqualTo(18);
  }
  
  @Test
  public void updateWithAlreadyUsedEmailAddressNotPossible() {
    assertThrows(ValidationException.class, () -> {

      List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
      Participant firstParticipant = participants.get(0);
      Participant secondParticipant = participants.get(1);

      firstParticipant.setEmail(secondParticipant.getEmail()); // Duplicated Email
      testHelperService.updateParticipant(firstParticipant);
    });
  }
  
  @Test
  public void standardUpdateParticipant() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    Participant firstParticipant = participants.get(0);
    firstParticipant.setAge(25);
    Participant result = testHelperService.updateParticipant(firstParticipant);
    assertThat(result.getAge()).isEqualTo(25);
  }
  

  private void assertParticipantListNumbers(List<ParticipantWithListNumberTO> resultList, int expectedStartNumber, int expectedEndNumber) {

    List<Integer> expectedParticipantNumbers = IntStream.rangeClosed(expectedStartNumber, expectedEndNumber).boxed().collect(Collectors.toList());
    assertThat(resultList).extracting("participantNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);
    assertThat(resultList).extracting("listNumber", Integer.class).containsExactlyElementsOf(expectedParticipantNumbers);
  }


}
