package org.runningdinner.admin.message.proposal;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class MessageProposalEventHandlerServiceIntegrationTest {

  private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private MessageService messageService;

  @Autowired
  private TeamService teamService;

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private TestMessageTaskHelperService testMessageTaskHelperService;

  @Autowired
  private ProposalRepository proposalRepository;

  private MailSenderMockInMemory mailSenderInMemory;

  @BeforeEach
  public void setUp() throws NoPossibleRunningDinnerException {
    this.mailSenderInMemory = testHelperService.getMockedMailSender();
    this.mailSenderInMemory.setUp();
    getProposalRepository().clear();
  }

  @Test
  public void proposalsAreStoredForSentMessages() throws InterruptedException {

    assertThat(getProposalRepository().getProposals()).isEmpty();

    RunningDinner runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
    this.testMessageTaskHelperService.awaitAllMessageTasksSent();
    // Assert normal running dinner creation message was sent
    assertThat(mailSenderInMemory.filterForMessageTo(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS)).isNotNull();
    // But this shouldn't cause any proposals being stored
    assertThat(getProposalRepository().getProposals()).isEmpty();

    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    testHelperService.awaitMessageJobFinished(messageJob);

    awaitTillNumProposalsPersisted(2);
    assertThat(getProposalRepository().getProposals()).hasSize(2);
    assertThat(getProposalRepository().getProposals().getFirst().storagePath()).contains("input/EVENT_DESCRIPTION");
    assertThat(getProposalRepository().getLast().storagePath()).contains(MessageType.PARTICIPANT.toString());

    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    TeamMessage teamMessage = new TeamMessage();
    teamMessage.setSubject("Team Arrangements");
    teamMessage.setMessage("Dear teams, here are your arrangements");
    teamMessage.setHostMessagePartTemplate("You are hosting at {meal}");
    teamMessage.setNonHostMessagePartTemplate("You are guest at {meal}");
    teamMessage.setTeamSelection(TeamSelection.ALL);
    messageService.sendTeamMessages(runningDinner.getAdminId(), teamMessage);

    // Verify that proposal for team message is created (no new for event description due to it was not changed)
    awaitTillNumProposalsPersisted(3);
    assertThat(getProposalRepository().getProposals()).hasSize(3);
    assertThat(getProposalRepository().getLast().storagePath()).contains(MessageType.TEAM.toString());
  }

  protected TestProposalRepositoryInMemory getProposalRepository() {
    return (TestProposalRepositoryInMemory) this.proposalRepository;
  }

  private void awaitTillNumProposalsPersisted(int expectedMinSizeOfProposals) {
    Awaitility
        .await()
        .atMost(2, TimeUnit.SECONDS)
        .until(() -> getProposalRepository().getProposals().size() >= expectedMinSizeOfProposals);
  }

}
