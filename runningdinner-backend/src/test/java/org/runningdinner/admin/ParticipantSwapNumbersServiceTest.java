package org.runningdinner.admin;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.ParticipantSwapNumbersService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class ParticipantSwapNumbersServiceTest {

  @Autowired
  private ParticipantSwapNumbersService participantSwapNumbersService;
  
  @Autowired
  private ParticipantService participantService;

  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private TeamService teamService;
  
  private RunningDinner runningDinner;
  
  @Test
  public void swapParticipantNumbers() {
    
    setUpDefaultDinner(22);
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    Participant firstParticipant = participants.get(0);
    assertThat(firstParticipant.getName().getFullnameFirstnameFirst()).isEqualTo("first1 last1");
    assertThat(firstParticipant.getParticipantNumber()).isEqualTo(1);
    
    Participant lastParticipant = participants.get(21);
    assertThat(lastParticipant.getName().getFullnameFirstnameFirst()).isEqualTo("first22 last22");
    assertThat(lastParticipant.getParticipantNumber()).isEqualTo(22);
    
    participantSwapNumbersService.swapParticipantNumbers(runningDinner.getAdminId(), firstParticipant.getId(), lastParticipant.getId());
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    firstParticipant = participants.get(0);
    assertThat(firstParticipant.getName().getFullnameFirstnameFirst()).isEqualTo("first22 last22");
    assertThat(firstParticipant.getParticipantNumber()).isEqualTo(1);
    
    lastParticipant = participants.get(21);
    assertThat(lastParticipant.getName().getFullnameFirstnameFirst()).isEqualTo("first1 last1");
    assertThat(lastParticipant.getParticipantNumber()).isEqualTo(22);
  }
  
  @Test
  public void swapParticipantNumbersNotPossibleWhenTeamsExisting() {
    
    setUpDefaultDinner(22);
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    Participant firstParticipant = participants.get(0);
    Participant lastParticipant = participants.get(21);
    
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    try {
      participantSwapNumbersService.swapParticipantNumbers(runningDinner.getAdminId(), firstParticipant.getId(), lastParticipant.getId());
      fail("Should never reach this point");
    } catch (IllegalArgumentException e) {
      // NOP
    }
    
    // This should however work due to both participants are not in teams:
    Participant previousParticipantBeforeLast = participants.get(20);
    participantSwapNumbersService.swapParticipantNumbers(runningDinner.getAdminId(), lastParticipant.getId(), previousParticipantBeforeLast.getId());
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    previousParticipantBeforeLast = participants.get(21);
    assertThat(previousParticipantBeforeLast.getName().getFullnameFirstnameFirst()).isEqualTo("first21 last21");
    assertThat(previousParticipantBeforeLast.getParticipantNumber()).isEqualTo(22);
    
    lastParticipant = participants.get(20);
    assertThat(lastParticipant.getName().getFullnameFirstnameFirst()).isEqualTo("first22 last22");
    assertThat(lastParticipant.getParticipantNumber()).isEqualTo(21);
  }
  
  @Test
  public void swapRootParticipantOfTeamPartnerWishWithSingleParticipant() {
  
    setUpDefaultDinner(17);
    final String adminId = runningDinner.getAdminId();
    var allParticipants = participantService.findParticipants(adminId, true);
    var firstParticipant = allParticipants.get(0);
    
    Participant rootParticipant = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Max Muster", "max@muster.de", "Maria Muster");
    Participant childParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(adminId, rootParticipant);
    assertThat(rootParticipant.getParticipantNumber()).isEqualTo(18);
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(19);
    
    // We have now 19 participants in total
    
    participantSwapNumbersService.swapParticipantNumbers(adminId, rootParticipant.getId(), firstParticipant.getId());
    
    rootParticipant = participantService.findParticipantById(adminId, rootParticipant.getId());
    childParticipant = participantService.findParticipantById(adminId, childParticipant.getId());
    
    // Assert both root and child participant are swapped proprly
    allParticipants = participantService.findParticipants(adminId, true);
    assertThat(allParticipants.get(0)).isEqualTo(rootParticipant);
    assertThat(allParticipants.get(0).getParticipantNumber()).isEqualTo(1);
    assertThat(allParticipants.get(1)).isEqualTo(childParticipant);
    assertThat(allParticipants.get(1).getParticipantNumber()).isEqualTo(2);
    // Assert proper sorting of remaining participants
    for (int index = 2; index < 18; index++) {
      int expectedParticipantNr = index + 1;
      assertThat(allParticipants.get(index).getParticipantNumber()).isEqualTo(expectedParticipantNr);
    }
    
    // Ensure first participant is now at end of list
    firstParticipant = participantService.findParticipantById(adminId, firstParticipant.getId());
    assertThat(allParticipants.get(18)).isEqualTo(firstParticipant);
    assertThat(allParticipants.get(18).getParticipantNumber()).isEqualTo(19);
  }
  
  
  @Test
  public void swapRootParticipantsWithSingleParticipantBetween() {
  
    setUpDefaultDinner(16);
    
    Participant rootParticipant1 = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Max Muster", "max@muster.de", "Maria Muster");
    Participant childParticipant1 = participantService.findChildParticipantOfTeamPartnerRegistration(runningDinner.getAdminId(), rootParticipant1);
    assertThat(rootParticipant1.getParticipantNumber()).isEqualTo(17);
    assertThat(childParticipant1.getParticipantNumber()).isEqualTo(18);
    
    Participant singleParticipant = testHelperService.registerSingleParticipant(runningDinner,"Sandra Single", "sandra@single.de");
    assertThat(singleParticipant.getParticipantNumber()).isEqualTo(19);
    
    Participant rootParticipant2 = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Foo Bar", "foo@bar.de", "Peter Lustig");
    Participant childParticipant2 = participantService.findChildParticipantOfTeamPartnerRegistration(runningDinner.getAdminId(), rootParticipant2);
    assertThat(rootParticipant2.getParticipantNumber()).isEqualTo(20);
    assertThat(childParticipant2.getParticipantNumber()).isEqualTo(21);
    
    // We have now 21 participants in total
    
    participantSwapNumbersService.swapParticipantNumbers(runningDinner.getAdminId(), rootParticipant1.getId(), rootParticipant2.getId());
    
    // Assert order of first participants stay same...
    var allParticipants = participantService.findParticipants(runningDinner.getAdminId(), true);
    assertThat(allParticipants.get(0).getParticipantNumber()).isEqualTo(1);
    assertThat(allParticipants.get(1).getParticipantNumber()).isEqualTo(2);
    // ...
    
    // Ensure single participant is not changed in order
    singleParticipant = participantService.findParticipantById(runningDinner.getAdminId(), singleParticipant.getId());
    assertThat(singleParticipant.getParticipantNumber()).isEqualTo(19);
 
    // Ensure participants are swapped
    rootParticipant1 = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipant1.getId());
    childParticipant1 = participantService.findParticipantById(runningDinner.getAdminId(), childParticipant1.getId());
    assertThat(rootParticipant1.getParticipantNumber()).isEqualTo(20);
    assertThat(childParticipant1.getParticipantNumber()).isEqualTo(21);
    
    rootParticipant2 = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipant2.getId());
    childParticipant2 = participantService.findParticipantById(runningDinner.getAdminId(), childParticipant2.getId());
    assertThat(rootParticipant2.getParticipantNumber()).isEqualTo(17);
    assertThat(childParticipant2.getParticipantNumber()).isEqualTo(18);
  }
  
  @Test
  public void swapChildParticipantFromWaitingListWithSingleParticipant() {
    
    setUpDefaultDinner(17);
    final String adminId = runningDinner.getAdminId();
    
    var allParticipants = participantService.findParticipants(adminId, true);
    var participant14th = allParticipants.get(13);
    
    Participant rootParticipant = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Max Muster", "max@muster.de", "Maria Muster");
    Participant childParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(adminId, rootParticipant);
    assertThat(rootParticipant.getParticipantNumber()).isEqualTo(18);
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(19);
    
    // We have now 19 participants in total
    
    participantSwapNumbersService.swapParticipantNumbers(adminId, participant14th.getId(), childParticipant.getId());
    
    allParticipants = participantService.findParticipants(adminId, true);
    assertThat(allParticipants.get(12).getParticipantNumber()).isEqualTo(13); // The 13th participant should not be modified (participant before the swapped one)
    
    rootParticipant = participantService.findParticipantById(adminId, rootParticipant.getId());
    childParticipant = participantService.findParticipantById(adminId, childParticipant.getId());
    participant14th = participantService.findParticipantById(adminId, participant14th.getId());
    
    // Fixed team partner wish should be placed where the single participant (14) has been:
    assertThat(allParticipants.get(13).getParticipantNumber()).isEqualTo(14);
    assertThat(allParticipants.get(13)).isEqualTo(rootParticipant);
    assertThat(allParticipants.get(14).getParticipantNumber()).isEqualTo(15);
    assertThat(allParticipants.get(14)).isEqualTo(childParticipant);
    
    // Assert proper sorting of remaining participants
    for (int index = 15; index < 19; index++) {
      int expectedParticipantNr = index + 1;
      assertThat(allParticipants.get(index).getParticipantNumber()).isEqualTo(expectedParticipantNr);
    }
    assertThat(allParticipants.get(18)).isEqualTo(participant14th); // The original 14th one should now be at end of list
  }
  
  @Test
  public void swapChildParticipantFromMiddleOfWaitingListWithSingleParticipant() {
    
    setUpDefaultDinner(17);
    final String adminId = runningDinner.getAdminId();
    
    var allParticipants = participantService.findParticipants(adminId, true);
    var participant14th = allParticipants.get(13);
    
    Participant rootParticipant = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Max Muster", "max@muster.de", "Maria Muster");
    Participant childParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(adminId, rootParticipant);
    assertThat(rootParticipant.getParticipantNumber()).isEqualTo(18);
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(19);
    
    Participant singleParticipant = testHelperService.registerSingleParticipant(runningDinner, "Sandra Single", "sandra@single.de");
    assertThat(singleParticipant.getParticipantNumber()).isEqualTo(20);
    
    // We have now 20 participants in total
    
    participantSwapNumbersService.swapParticipantNumbers(adminId, participant14th.getId(), childParticipant.getId());

    rootParticipant = participantService.findParticipantById(adminId, rootParticipant.getId());
    childParticipant = participantService.findParticipantById(adminId, childParticipant.getId());
    participant14th = participantService.findParticipantById(adminId, participant14th.getId());
    
    allParticipants = participantService.findParticipants(adminId, true);
    assertThat(allParticipants.get(12).getParticipantNumber()).isEqualTo(13); // The 13th participant should not be modified (participant before the swapped one)
    
    // Fixed team partner wish should be placed where the single participant (14) has been:
    assertThat(allParticipants.get(13).getParticipantNumber()).isEqualTo(14);
    assertThat(allParticipants.get(13)).isEqualTo(rootParticipant);
    assertThat(allParticipants.get(14).getParticipantNumber()).isEqualTo(15);
    assertThat(allParticipants.get(14)).isEqualTo(childParticipant);
    
    // Assert proper sorting of remaining participants
    for (int index = 15; index < 20; index++) {
      int expectedParticipantNr = index + 1;
      assertThat(allParticipants.get(index).getParticipantNumber()).isEqualTo(expectedParticipantNr);
    }
    assertThat(allParticipants.get(18)).isEqualTo(participant14th); // The original 14th one should now be at the second last of list
  }
  
  @Test(expected = ValidationException.class)
  public void swapChildParticipantDownNotPossible() {
  
    setUpDefaultDinner(17);
    
    Participant rootParticipant = testHelperService.registerParticipantsAsFixedTeam(runningDinner,"Max Muster", "max@muster.de", "Maria Muster");
    Participant childParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(runningDinner.getAdminId(), rootParticipant);
    assertThat(rootParticipant.getParticipantNumber()).isEqualTo(18);
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(19);
    
    Participant singleParticipant = testHelperService.registerSingleParticipant(runningDinner,"Sandra Single", "sandra@single.de");
    assertThat(singleParticipant.getParticipantNumber()).isEqualTo(20);
    
    participantSwapNumbersService.swapParticipantNumbers(runningDinner.getAdminId(), singleParticipant.getId(), childParticipant.getId());
  }
  
  protected RunningDinner setUpDefaultDinner(int numParticipants) {

    LocalDate dinnerDate = LocalDate.now().plusDays(7);
    this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(dinnerDate, numParticipants);
    return this.runningDinner;
  }
  
}
