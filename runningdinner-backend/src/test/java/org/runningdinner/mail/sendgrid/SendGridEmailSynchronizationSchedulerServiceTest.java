package org.runningdinner.mail.sendgrid;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.PrivateFieldAccessor;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class SendGridEmailSynchronizationSchedulerServiceTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private SendGridEmailSynchronizationService sendGridEmailSynchronizationService;
  
  @Autowired
  private SendGridEmailSynchronizationSchedulerService sendGridEmailSynchronizationSchedulerService;
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private ActivityService activityService;
  
  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  @Autowired
  private ObjectMapper objectMapper;
  
  @Mock
  private SendGrid sendGridMock;

  private RunningDinner runningDinner;

  private AutoCloseable mockitoMocksInstance;

  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    mockitoMocksInstance = MockitoAnnotations.openMocks(this);

    MailSenderMockInMemory mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    mailSenderInMemory.setUp();
    this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 18);
    
    // setup mocks
    SendGridMailWrapper sendGridMailWrapper = new SendGridMailWrapper("MockedKey", objectMapper, true);
    PrivateFieldAccessor.setField(sendGridMailWrapper, "sendGridClient", sendGridMock);
    sendGridEmailSynchronizationService.setSendGridMailWrapper(sendGridMailWrapper);
  }

  @After
  public void tearDown() throws Exception {
    mockitoMocksInstance.close();
  }

  @Test
  public void testSynchronizeSentMails() throws IOException {

    MessageJob messageJob = sendParticipantMessages();

    Mockito
      .when(sendGridMock.api(Mockito.any()))
      .thenReturn(newEmptyResponse());

    LocalDateTime now = LocalDateTime.now();
    sendGridEmailSynchronizationSchedulerService.synchronizeSentMails(now);

    assertMailSynchronizationState(now, MailSynchronizationResult.SUCCESS);

    assertThat(activityService.findActivitiesByTypes(runningDinner.getAdminId(), ActivityType.MESSAGE_JOB_SENDING_FAILED)).isEmpty();

    messageJob = assertMessageJob(messageJob.getId(), FuzzyBoolean.FALSE);

    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    String invalidEmail = participants.get(0).getEmail();

    // First API call is for invalid mails, other ones are not relevant for us:
    Mockito
      .when(sendGridMock.api(Mockito.any()))
      .thenReturn(newResponse(invalidEmail), newEmptyResponse(), newEmptyResponse(), newEmptyResponse());

    now = LocalDateTime.now();
    sendGridEmailSynchronizationSchedulerService.synchronizeSentMails(now);

    assertMailSynchronizationState(now, MailSynchronizationResult.SUCCESS_WITH_FOUND_SUPRESSIONS);

    List<Activity> messageJobSendingFailedActivities = activityService.findActivitiesByTypes(runningDinner.getAdminId(), ActivityType.MESSAGE_JOB_SENDING_FAILED);
    assertThat(messageJobSendingFailedActivities).hasSize(1);

    messageJob = assertMessageJob(messageJob.getId(), FuzzyBoolean.TRUE);

    List<MessageTask> messageTasks = messageService.findMessageTasks(runningDinner.getAdminId(), messageJob.getId());
    MessageTask failedMessageTask = messageTasks
                                      .stream()
                                      .filter(mt -> mt.getRecipientEmail().equals(invalidEmail))
                                      .findAny()
                                      .get();
    assertThat(failedMessageTask.getSendingResult().isDelieveryFailed()).isTrue();
  }


  private MailSynchronizationState assertMailSynchronizationState(LocalDateTime expectedDateTimeAfter, MailSynchronizationResult expectedResult) {

    Optional<MailSynchronizationState> mailSyncState = sendGridEmailSynchronizationService.findLastSuccessfulMailSynchronizationState();
    assertThat(mailSyncState).isPresent();
    assertThat(mailSyncState.get().getSynchronizationDate())
        .isAfterOrEqualTo(expectedDateTimeAfter.minusSeconds(1));
    assertThat(mailSyncState.get().getSynchronizationResult()).isEqualTo(expectedResult);
    return mailSyncState.get();
  }

  private MessageJob sendParticipantMessages() {

    ParticipantMessage participantMessage = new ParticipantMessage();
    participantMessage.setMessage("Message");
    participantMessage.setSubject("Subject");
    participantMessage.setParticipantSelection(ParticipantSelection.ALL);
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);

    testHelperService.awaitMessageJobFinished(messageJob);
    return messageJob;
  }

  private MessageJob assertMessageJob(UUID messageJobId, FuzzyBoolean expectedSendingFailed) {

    MessageJob messageJob = messageService.findMessageJob(runningDinner.getAdminId(), messageJobId);
    assertThat(messageJob.getSendingFailed()).isEqualTo(expectedSendingFailed);
    return messageJob;
  }

  private Response newResponse(String ... suppressedEmails) {
    Response result = new Response();

    StringBuilder body = new StringBuilder();

    body.append("[");
    int cnt = 0;
    for (String suppressedEmail : suppressedEmails) {
      if (cnt++ > 0) {
        body.append(",\r\n");
      }
      body.append("{\r\n");
      body.append("\"created\": ").append(1449953655).append(",\r\n");
      body.append("\"email\": ").append("\"").append(suppressedEmail).append("\"").append(",\r\n");
      body.append("\"reason\": \"Foo\"").append("\r\n");
      body.append("}");
    }
    body.append("]");
    result.body = body.toString();
    return result;
  }

  private Response newEmptyResponse() {
    
    Response result = new Response();
    result.body = "[]";
    return result;
  }
}
