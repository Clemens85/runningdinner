package org.runningdinner.admin.message.proposal;

import org.junit.jupiter.api.Test;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerConfig;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class ProposalBaseGeneratorTest {

  @Test
  public void generateEventDescriptionProposal() {
    RunningDinner runningDinner = newRunningDinner();
    ProposalBase result = ProposalBaseGenerator.newEventDescriptionProposal(runningDinner);
    assertEventDescriptionProposal(result, runningDinner);
  }

  @Test
  public void generateEventDescriptionProposalWithAfterPartyLocation() {
    RunningDinner runningDinner = newRunningDinner();
    AfterPartyLocation afterPartyLocation = newAfterPartyLocation();
    runningDinner.setAfterPartyLocation(afterPartyLocation);
    
    ProposalBase result = ProposalBaseGenerator.newEventDescriptionProposal(runningDinner);
    assertEventDescriptionProposal(result, runningDinner);
    assertThat(result.textContent()).contains("After Party at Bar XYZ");
  }

  @Test
  public void generateParticipantMessageProposal() {
    RunningDinner runningDinner = newRunningDinner();
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setSubject("Welcome Message");
    participantMessage.setMessage("Hello participants, this is a test message");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    
    ProposalBase result = ProposalBaseGenerator.newMessageProposal(participantMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/messages/PARTICIPANT/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message");
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
    
    ProposalBase result = ProposalBaseGenerator.newMessageProposal(teamMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/messages/TEAM/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message");
    assertThat(result.textContent()).contains("Dear teams, here are your arrangements");
    assertThat(result.textContent()).contains("## Host Template");
    assertThat(result.textContent()).contains("You are hosting at {meal}");
    assertThat(result.textContent()).contains("## Non Host Template");
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
    
    ProposalBase result = ProposalBaseGenerator.newMessageProposal(dinnerRouteMessage, runningDinner);
    
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/messages/DINNER_ROUTE/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Subject");
    assertThat(result.textContent()).contains("## Message");
    assertThat(result.textContent()).contains("Here is your dinner route: {route}");
    assertThat(result.textContent()).contains("## Hosts Template");
    assertThat(result.textContent()).contains("Hosts: {mobilenumber}");
    assertThat(result.textContent()).contains("## Self Template");
    assertThat(result.textContent()).contains("Your team is hosting");
  }

  private RunningDinner newRunningDinner() {
    RunningDinner runningDinner = new RunningDinner();
    runningDinner.setAdminId(UUID.randomUUID().toString());
    runningDinner.setTitle("Test Dinner");
    runningDinner.setCity("Test City");
    runningDinner.setZip("12345");
    runningDinner.setDate(LocalDate.now().plusDays(7));
    runningDinner.setEmail("test@example.com");
    runningDinner.setLanguageCode("en");
    runningDinner.setConfiguration(RunningDinnerConfig.newConfigurer().build());
    
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
    afterPartyLocation.setTime(LocalDateTime.now());
    return afterPartyLocation;
  }

  private void assertEventDescriptionProposal(final ProposalBase result, final RunningDinner runningDinner) {
    assertThat(result).isNotNull();
    assertThat(result.storagePath()).isEqualTo("input/event_descriptions/" + runningDinner.getAdminId() + ".md");
    assertThat(result.textContent()).contains("## Test Event Title");
    assertThat(result.textContent()).contains("This is a test event description");
  }
}
