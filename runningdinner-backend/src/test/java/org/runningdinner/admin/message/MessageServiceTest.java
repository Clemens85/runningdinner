package org.runningdinner.admin.message;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.assertj.core.api.Condition;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageJobRepository;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.job.SendingResult;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.processor.MessageTaskSchedulerService;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellation;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class MessageServiceTest {

  private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private TeamService teamService;
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  @Autowired
  private MessageTaskSchedulerService messageTaskSchedulerService;
  
  @Autowired
  private MessageJobRepository messageJobRepository;

  
  private MailSenderMockInMemory mailSenderInMemory;
  
  private RunningDinner runningDinner;

  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    this.mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    this.mailSenderInMemory.setUp();
    this.mailSenderInMemory.addIgnoreRecipientEmail(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
  }

  @Test
  public void testSendParticipantMessages() {

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    assertThat(mailSenderInMemory.getMessages()).isEmpty();
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    Set<String> recipientEmails = messages
                                    .stream().map(m -> m.getTo()[0])
                                    .collect(Collectors.toSet());
   
    Set<String> participantEmails = participants
                                      .stream()
                                      .filter(p -> StringUtils.isNotEmpty(p.getEmail()))
                                      .map(p -> p.getEmail())
                                      .collect(Collectors.toSet());

    
    assertThat(participantEmails).containsOnlyElementsOf(recipientEmails);
    assertThat(recipientEmails).hasSize(participantEmails.size());
    
    List<MessageTask> messageTasks = messageTaskRepository.findByParentJobIdOrderByCreatedAtAsc(messageJob.getId());
    assertThat(messageTasks).hasSize(TOTAL_NUMBER_OF_PARTICIPANTS);
    assertThat(messageTasks).are(new Condition<>(m -> !m.getSendingResult().isDelieveryFailed(), "Expected no delievery failed"));
    assertThat(messageTasks).are(new Condition<>(m -> m.getSendingStatus() == SendingStatus.SENDING_FINISHED, "Expected all sending status to be finished"));
    
    messageJob = messageTasks.get(0).getParentJob();
    assertThat(messageJob.getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
  }
  
  
  @Test
  public void testSendParticipantMessagesWithInvalidEmail() {

    // Create dinner with only 2 participants for simple testing:
    runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 2);
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    
    assertThat(mailSenderInMemory.getMessages()).isEmpty();
    
    participants.get(0).setEmail("invalid@email.de");
    participantRepository.save(participants.get(0));
    
    mailSenderInMemory.addFailingRecipientEmail("invalid@email.de");
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).hasSize(1); // one email was sent and one was not sent
    
    List<MessageTask> messageTasks = messageTaskRepository.findByParentJobIdOrderByCreatedAtAsc(messageJob.getId());
    assertThat(messageTasks).hasSize(2);
    assertThat(messageTasks)
      .filteredOn(m -> m.getSendingResult().isDelieveryFailed())
      .extracting("recipientEmail").containsExactly("invalid@email.de");
    
    messageJob = messageTasks.get(0).getParentJob();
    assertThat(messageJob.getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
    assertThat(messageJob.getSendingFailed()).isEqualTo(FuzzyBoolean.TRUE);
  }
  
  @Test
  public void testReSendMessageTask() {
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
   
    testHelperService.awaitMessageJobFinished(messageJob);
    
    this.mailSenderInMemory.removeAllMessages();
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).isEmpty();
    
    List<MessageTask> messageTasks = messageTaskRepository.findByParentJobIdOrderByCreatedAtAsc(messageJob.getId());
    MessageTask messageTask = messageTasks.get(0);
    messageTask.setRecipientEmail("new@mail.de");
    messageTask.getMessage().setSubject("NewSubject");
    messageTask.getMessage().setContent("NewContent");
    messageService.reSendMessageTask(messageTask.getAdminId(), messageTask.getId(), messageTask);
    
    messageTask = messageTaskRepository.findByIdAndAdminId(messageTask.getId(), messageTask.getAdminId());
    assertThat(messageTask.getRecipientEmail()).isEqualTo("new@mail.de");
    assertThat(messageTask.getMessage().getSubject()).isEqualTo("NewSubject");
    assertThat(messageTask.getMessage().getContent()).isEqualTo("NewContent");
    
    messages = mailSenderInMemory.getMessages();
    assertThat(messages).hasSize(1);
  }
  
  @Test
  public void testCustomSelection() {
   
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.CUSTOM_SELECTION);
    participantMessage.setCustomSelectedParticipantIds(Collections.singletonList(participants.get(0).getId()));
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
    
    List<MessageTask> messageTasks = messageService.findMessageTasks(runningDinner.getAdminId(), messageJob.getId());
    assertThat(messageTasks).hasSize(1);
    assertThat(messageTasks.get(0).getRecipientEmail()).isEqualTo(participants.get(0).getEmail());  
  }
  
  @Test
  public void testCancelledTeamHandling() throws NoPossibleRunningDinnerException {

    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    TeamMessage teamMessage = new TeamMessage();
    teamMessage.setMessage("Message");
    teamMessage.setSubject("Subject");
    teamMessage.setHostMessagePartTemplate("Foo");
    teamMessage.setNonHostMessagePartTemplate("Bar");
    teamMessage.setTeamSelection(TeamSelection.ALL);
    
    MessageJob createdMessageJob = messageService.sendTeamMessages(runningDinner.getAdminId(), teamMessage);
    assertThat(createdMessageJob.getNumberOfMessageTasks()).isEqualTo(18);
    
    testHelperService.awaitMessageJobFinished(createdMessageJob);
    
    Team team = teamService.findTeamArrangements(runningDinner.getAdminId(), false).get(0);
    TeamCancellation teamCancellation = new TeamCancellation();
    teamCancellation.setReplaceTeam(false);
    teamCancellation.setTeamId(team.getId());
    teamService.cancelTeam(runningDinner.getAdminId(), teamCancellation);
   
    createdMessageJob = messageService.sendTeamMessages(runningDinner.getAdminId(), teamMessage);
    assertThat(createdMessageJob.getNumberOfMessageTasks()).isEqualTo(16);
    
    testHelperService.awaitMessageJobFinished(createdMessageJob);
  }
  
  @Test(expected = MailException.class)
  public void testReSendMessageTaskFailure() {
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
   
    List<MessageTask> messageTasks = messageTaskRepository.findByParentJobIdOrderByCreatedAtAsc(messageJob.getId());
    MessageTask messageTask = messageTasks.get(0);
    mailSenderInMemory.addFailingRecipientEmail(messageTask.getRecipientEmail());
    messageService.reSendMessageTask(messageTask.getAdminId(), messageTask.getId(), messageTask);
  }
  
  @Test
  public void testMealSpecificsAreCorrectFormattedInDinnerRoute() throws NoPossibleRunningDinnerException {

    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    TeamMeetingPlan firstTeamToTest = getTeamMeetingPlanOfFirstTeam();
    List<Team> guestTeams = firstTeamToTest.getGuestTeams(); 

    Team firstGuestTeam = guestTeams.get(0);
    Participant participant = firstGuestTeam.getTeamMembersOrdered().get(0);
    participant.setMealSpecifics(new MealSpecifics(true, true, true, true, StringUtils.EMPTY));
    participant = participantRepository.save(participant);
    
    DinnerRouteMessage dinnerRouteMessage = new DinnerRouteMessage();
    dinnerRouteMessage.setTeamSelection(TeamSelection.CUSTOM_SELECTION);
    dinnerRouteMessage.setCustomSelectedTeamIds(Collections.singletonList(firstTeamToTest.getTeam().getId()));
    dinnerRouteMessage.setHostsTemplate("Foo");
    dinnerRouteMessage.setSelfTemplate("{mealspecifics}");
    dinnerRouteMessage.setSubject("Subject");
    dinnerRouteMessage.setMessage("{route}");
    
    PreviewMessage previewMessage = messageService.getDinnerRoutePreview(runningDinner.getAdminId(), dinnerRouteMessage).get(0);
    assertThat(previewMessage.getMessage()).contains("Vegetarisch", "Vegan", "Laktosefrei", "Glutenfrei");

    // Now verify that for this team nothing special is contained due this team has no guests with meal specifics:
    dinnerRouteMessage.setCustomSelectedTeamIds(Collections.singletonList(guestTeams.get(1).getId()));
    previewMessage = messageService.getDinnerRoutePreview(runningDinner.getAdminId(), dinnerRouteMessage).get(0);
  
    assertThat(previewMessage.getMessage())
      .doesNotContain("Vegetarisch")
      .doesNotContain("Vegan")
      .doesNotContain("Laktosefrei")
      .doesNotContain("Glutenfrei");

  }

  @Test
  public void sendingQueuedMessagesByScheduler() {
    
    MessageJob messageJob = messageService.findMessageJobs(runningDinner.getAdminId(), MessageType.NEW_RUNNING_DINNER).get(0);
    testHelperService.awaitMessageJobFinished(messageJob);
    
    MessageTask messageTask = messageService.findMessageTasks(runningDinner.getAdminId(), messageJob.getId()).get(0);
    
    messageTask.setSendingStatus(SendingStatus.QUEUED);
    messageTask.setSendingResult(new SendingResult());
    messageTask.setSendingStartTime(null);
    messageTask.setSendingEndTime(null);
    messageTaskRepository.save(messageTask);
    
    messageJob = messageJobRepository.findByAdminIdAndId(runningDinner.getAdminId(), messageJob.getId());
    messageJob.setSendingStatus(SendingStatus.QUEUED);
    messageJobRepository.save(messageJob);
    
    messageTask = messageTaskRepository.findByIdAndAdminId(messageTask.getId(), runningDinner.getAdminId());
    assertThat(messageTask.getSendingStatus()).isEqualTo(SendingStatus.QUEUED);
    
    LocalDateTime now = LocalDateTime.now();
    messageTaskSchedulerService.sendQeuedMessageTasks(now);
    
    messageTask = messageTaskRepository.findByIdAndAdminId(messageTask.getId(), runningDinner.getAdminId());
    assertThat(messageTask.getSendingStatus()).isEqualTo(SendingStatus.QUEUED);
    
    now = LocalDateTime.now().plusDays(1);
    messageTaskSchedulerService.sendQeuedMessageTasks(now);
    
    messageTask = messageTaskRepository.findByIdAndAdminId(messageTask.getId(), runningDinner.getAdminId());
    assertThat(messageTask.getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
    assertThat(messageTask.getParentJob().getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
  }
  
  private TeamMeetingPlan getTeamMeetingPlanOfFirstTeam() {

    Team firstTeamToTest = teamService.findTeamArrangements(runningDinner.getAdminId(), false).get(0);
    return teamService.findTeamMeetingPlan(runningDinner.getAdminId(), firstTeamToTest.getId());
  }
  
}

