package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataV2TO;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class ReSendRunningDinnerCreatedMessageServiceTest {

  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private ReSendRunningDinnerCreatedMessageService reSendRunningDinnerCreatedMessageService;

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  private RunningDinner runningDinnerNotAcknowledged;

  private MailSenderMockInMemory mailSenderInMemory;

  @Before
  public void setUp() {
    this.runningDinnerNotAcknowledged = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(7), 2, RegistrationType.PUBLIC, false);
    
    this.mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    this.mailSenderInMemory.setUp();
  }
  
  @Test
  public void notAcknowledgedDinnerAllowsRegistrationWithPartnerWish() {
    
    RegistrationDataV2TO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de",
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    registrationData.setTeamPartnerWish("foo@bar.de");
    
    RegistrationSummary result = frontendRunningDinnerService.performRegistration(runningDinnerNotAcknowledged.getPublicSettings().getPublicId(), registrationData, false);
    assertThat(result).isNotNull();
    
    Participant newRegisteredParticipant = participantService.findParticipantByEmail(runningDinnerNotAcknowledged.getAdminId(), "max@muster.de").get();
    participantService.updateParticipantSubscription(newRegisteredParticipant.getId(), LocalDateTime.now(), true, runningDinnerNotAcknowledged);
    
    MessageJob messageJob = messageService.findMessageJobs(runningDinnerNotAcknowledged.getAdminId(), MessageType.TEAM_PARTNER_WISH).get(0);
    testHelperService.awaitMessageJobFinished(messageJob);
    SimpleMailMessage message = mailSenderInMemory.filterForMessageTo("foo@bar.de");
    
    assertThat(message).isNotNull();    
  }
  
  @Test
  public void reSendRunningDinnerCreatedMessageWithSameMail() {
    
    List<MessageJob> messageJobs = messageService.findMessageJobs(runningDinnerNotAcknowledged.getAdminId(), MessageType.NEW_RUNNING_DINNER);
    assertThat(messageJobs).hasSize(1);
    
    ReSendRunningDinnerCreatedMessage reSendRunningDinnerCreatedMessage = new ReSendRunningDinnerCreatedMessage();
    reSendRunningDinnerCreatedMessage.setNewEmailAddress(runningDinnerNotAcknowledged.getEmail());
    
    reSendRunningDinnerCreatedMessageService.reSendRunningDinnerCreatedMessage(runningDinnerNotAcknowledged.getAdminId(), reSendRunningDinnerCreatedMessage);
    messageJobs = messageService.findMessageJobs(runningDinnerNotAcknowledged.getAdminId(), MessageType.NEW_RUNNING_DINNER);
    assertThat(messageJobs).hasSize(2);
  }
  
  @Test
  public void reSendRunningDinnerCreatedMessageWithDifferentMail() {
    
    List<MessageJob> messageJobs = messageService.findMessageJobs(runningDinnerNotAcknowledged.getAdminId(), MessageType.NEW_RUNNING_DINNER);
    assertThat(messageJobs).hasSize(1);
    
    ReSendRunningDinnerCreatedMessage reSendRunningDinnerCreatedMessage = new ReSendRunningDinnerCreatedMessage();
    reSendRunningDinnerCreatedMessage.setNewEmailAddress("changed@mail.de");
    
    reSendRunningDinnerCreatedMessageService.reSendRunningDinnerCreatedMessage(runningDinnerNotAcknowledged.getAdminId(), reSendRunningDinnerCreatedMessage);
    messageJobs = messageService.findMessageJobs(runningDinnerNotAcknowledged.getAdminId(), MessageType.NEW_RUNNING_DINNER);
    assertThat(messageJobs).hasSize(2);
    
    runningDinnerNotAcknowledged = runningDinnerService.findRunningDinnerByAdminId(runningDinnerNotAcknowledged.getAdminId());
    assertThat(runningDinnerNotAcknowledged.getEmail()).isEqualTo("changed@mail.de");
    assertThat(runningDinnerNotAcknowledged.getPublicSettings().getPublicContactEmail()).isEqualTo("changed@mail.de");
  }
  
}
