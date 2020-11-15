package org.runningdinner.admin.message;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.assertj.core.api.Condition;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.ApplicationConfig;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("dev,junit")
@SpringBootTest(
  classes = { ApplicationConfig.class },
  properties = {
      "message.max-allowed-tasks-per-job=2",
      "message.max-allowed-tasks-per-dinner=6",
      
      "deliver.feedback.mail.scheduler.enabled=false",
      "delete.runninginnder.instances.scheduler.enabled=false",
      "sendgrid.sync.sent.mails=false"
    }
)
@WebAppConfiguration
public class MessageAbuseSuspicionTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);
  
  private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
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
  public void abuseSuspicionDetectedForTooManyMessageTasks() {

    assertThat(mailSenderInMemory.getMessages()).isEmpty();
    
    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
    
    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).isEmpty();
    
    List<MessageTask> messageTasks = messageTaskRepository.findByParentJobIdOrderByCreatedAtAsc(messageJob.getId());
    assertThat(messageTasks).hasSize(TOTAL_NUMBER_OF_PARTICIPANTS);
    assertThat(messageTasks).are(new Condition<>(m -> m.getSendingResult().isDelieveryFailed(), "Expected delievery failed of all message tasks"));
    assertThat(messageTasks).are(new Condition<>(m -> m.getSendingResult().getFailureType() == FailureType.ABUSE_SUSPICION, "Expected all to be of failure type ABUSE_SUSPICION"));
    assertThat(messageTasks).are(new Condition<>(m -> m.getSendingStatus() == SendingStatus.SENDING_FINISHED, "Expected all sending status to be finished"));
    
    messageJob = messageTasks.get(0).getParentJob();
    assertThat(messageJob.getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
  }
  
}
