package org.runningdinner.admin.message.proposal;

import org.junit.jupiter.api.Test;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerConfig;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class ProposalExampleGeneratorTest {

  @Test
  public void generateEventDescriptionProposal() {
    RunningDinner runningDinner = newRunningDinner();
    ProposalExample result = ProposalExampleGenerator.newEventDescriptionProposalExample(runningDinner);
    assertEventDescriptionProposal(result, runningDinner);
  }

  @Test
  public void generateEventDescriptionProposalWithAfterPartyLocation() {
    RunningDinner runningDinner = newRunningDinner();
    AfterPartyLocation afterPartyLocation = newAfterPartyLocation();
    runningDinner.setAfterPartyLocation(afterPartyLocation);
    
    ProposalExample result = ProposalExampleGenerator.newEventDescriptionProposalExample(runningDinner);
    assertEventDescriptionProposal(result, runningDinner);
    assertThat(result.textContent()).contains("### After Party at Bar XYZ - 22:00 Uhr");
  }

  @Test
  public void generateParticipantMessageProposal() {
    RunningDinner runningDinner = newRunningDinner();
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setSubject("Welcome Message");
    participantMessage.setMessage("Hello participants, this is a test message");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    
    ProposalExample result = ProposalExampleGenerator.newMessageProposalExample(participantMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/message/PARTICIPANT/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message Template");
    assertThat(result.textContent()).contains("Hello participants, this is a test message");
  }

  @Test
  public void generateTeamMessageProposal() {
    RunningDinner runningDinner = newRunningDinner();
    TeamMessage teamMessage = new TeamMessage();
    teamMessage.setSubject("Team Arrangements");
    teamMessage.setMessage("Dear teams, here are your arrangements");
    teamMessage.setHostMessagePartTemplate("You are hosting at {meal}");
    teamMessage.setNonHostMessagePartTemplate("You are guest at {meal}");
    teamMessage.setTeamSelection(TeamSelection.ALL);
    
    ProposalExample result = ProposalExampleGenerator.newMessageProposalExample(teamMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/message/TEAM/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message Template");
    assertThat(result.textContent()).contains("Dear teams, here are your arrangements");
    assertThat(result.textContent()).contains("### Host Template");
    assertThat(result.textContent()).contains("You are hosting at {meal}");
    assertThat(result.textContent()).contains("### Non Host Template");
    assertThat(result.textContent()).contains("You are guest at {meal}");
  }

  @Test
  public void generateDinnerRouteMessageProposal() {
    RunningDinner runningDinner = newRunningDinner();
    DinnerRouteMessage dinnerRouteMessage = new DinnerRouteMessage();
    dinnerRouteMessage.setSubject("Dinner Route");
    dinnerRouteMessage.setMessage("Here is your dinner route: {route}");
    dinnerRouteMessage.setHostsTemplate("Hosts: {mobilenumber}");
    dinnerRouteMessage.setSelfTemplate("Your team is hosting");
    dinnerRouteMessage.setTeamSelection(TeamSelection.ALL);
    
    ProposalExample result = ProposalExampleGenerator.newMessageProposalExample(dinnerRouteMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/message/DINNER_ROUTE/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message Template");
    assertThat(result.textContent()).contains("Here is your dinner route: {route}");
    assertThat(result.textContent()).contains("### Hosts Template");
    assertThat(result.textContent()).contains("Hosts: {mobilenumber}");
    assertThat(result.textContent()).contains("### Self Template");
    assertThat(result.textContent()).contains("Your team is hosting");
  }

  private RunningDinner newRunningDinner() {
    RunningDinner runningDinner = new RunningDinner();
    runningDinner.setAdminId(UUID.randomUUID().toString());
    runningDinner.setTitle("Test Dinner");
    runningDinner.setCity("Test City");
    runningDinner.setZip("12345");
    runningDinner.setDate(LocalDate.of(2026, 12, 24));
    runningDinner.setEmail("test@example.com");
    runningDinner.setLanguageCode("de");
    runningDinner.setConfiguration(
			RunningDinnerConfig.newConfigurer()
				.havingMeals(List.of(
					new MealClass("Vorspeise", LocalDateTime.of(2026, 12, 24, 18, 0)),
					new MealClass("Hauptgang", LocalDateTime.of(2026, 12, 24, 20, 0))
				))
				.build()
		);

    PublicSettings publicSettings = new PublicSettings();
    publicSettings.setPublicTitle("Test Event Title");
    publicSettings.setPublicDescription("This is a test event description");
    runningDinner.setPublicSettings(publicSettings);
    
    return runningDinner;
  }

  private static AfterPartyLocation newAfterPartyLocation() {
    AfterPartyLocation afterPartyLocation = new AfterPartyLocation();
    afterPartyLocation.setTitle("After Party at Bar XYZ");
    afterPartyLocation.setStreet("Main Street");
    afterPartyLocation.setStreetNr("123");
    afterPartyLocation.setZip("12345");
    afterPartyLocation.setCityName("Test City");
    afterPartyLocation.setTime(LocalDateTime.of(2026, 12, 24, 22, 0));
    return afterPartyLocation;
  }

  private void assertEventDescriptionProposal(final ProposalExample result, final RunningDinner runningDinner) {
    assertThat(result).isNotNull();
			assertThat(result.storagePath()).isEqualTo("input/EVENT_DESCRIPTION/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("# Test Event Title");
    assertThat(result.textContent()).contains("12345 Test City");
		assertThat(result.textContent()).contains("24.12.2026");
		assertThat(result.textContent()).contains("This is a test event description");
		assertThat(result.textContent()).contains("## Ablauf");
		assertThat(result.textContent()).contains("18:00 Uhr: Vorspeise");
		assertThat(result.textContent()).contains("20:00 Uhr: Hauptgang");
  }
}
