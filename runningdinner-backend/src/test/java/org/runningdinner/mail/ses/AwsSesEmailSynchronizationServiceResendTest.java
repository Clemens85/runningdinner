package org.runningdinner.mail.ses;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.MailUtil;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@ExtendWith(SpringExtension.class)
@ApplicationTest
@TestPropertySource(properties = {
	"mail.mailjet.enabled=false"
})
public class AwsSesEmailSynchronizationServiceResendTest {

	@Autowired
	private AwsSesEmailSynchronizationService awsSesEmailSynchronizationService;

	@Autowired
	private TestMessageTaskHelperService testMessageTaskHelperService;

	@Autowired
	private MessageTaskRepository messageTaskRepository;

	@Autowired
	private TestHelperService testHelperService;

	@Autowired
	private ParticipantService participantService;

	@BeforeEach
	public void setUp() {
		testHelperService.getMockedMailSender().setUp();
	}

	@Test
	public void messageTaskIsResentWithAlternativeProviderOnBounce() {

		MailSenderMockInMemory mockedMailSender = testHelperService.getMockedMailSender();

		// Our notification example contains an entry created (and bounced) at: 2016-01-27T14:59:38.237Z
		LocalDateTime sendingStartTime = MailUtil.parseIsoTimestampToLocalDateTime("2016-01-27T14:59:38.237Z");
		assertThat(sendingStartTime.getHour()).isEqualTo(15); // German is UTC + 1
		assertThat(sendingStartTime.getDayOfMonth()).isEqualTo(27);

		// Simulate MessageTask
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(7), 1);
		addParticipant(runningDinner);
		testHelperService.sendMessagesToAllParticipants(runningDinner);
		MessageTask messageTask = findParticipantMessageTask(runningDinner);
		testHelperService.awaitMessageJobFinished(messageTask.getParentJob());

		// Simulate MessageTask was sent in past with date X and with AWS_SES
		testMessageTaskHelperService.updateMessageTaskSenders(List.of(messageTask), MailProvider.AWS_SES);
		testMessageTaskHelperService.updateMessageTaskSentDates(List.of(messageTask), sendingStartTime);

		// Ensure we have the proper test base now:
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSender()).isEqualTo(MailProvider.AWS_SES.toString());
		assertThat(messageTask.getSendingStartTime()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));

		assertThat(messageTask.getResendCount()).isZero();
		assertThat(messageTask.getOriginalSender()).isNull();
		mockedMailSender.removeAllMessages(); // Clear out the message sent during initial sending

		assertThat(awsSesEmailSynchronizationService.handleSesNotification(AwsSesNotificationExamples.BOUNCE)).isTrue();

		// Verify MessageTask was automatically resent with other provider:
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isFalse();
		assertThat(messageTask.getSendingResult().getFailureType()).isNull();
		assertThat(messageTask.getSendingResult().getFailureMessage()).isNullOrEmpty();
		assertThat(messageTask.getSendingResult().getDelieveryFailedDate()).isNull();

		assertThat(messageTask.getSender()).isEqualTo(MailProvider.MOCK.toString());
		assertThat(messageTask.getSendingStartTime()).isAfter(sendingStartTime); // Should be updated
		assertThat(messageTask.getSendingEndTime()).isAfter(sendingStartTime);
		assertThat(messageTask.getSendingStatus()).isEqualTo(SendingStatus.SENDING_FINISHED);
		assertThat(messageTask.getResendCount()).isOne();
		assertThat(messageTask.getOriginalSender()).isEqualTo(MailProvider.AWS_SES.toString());

		SimpleMailMessage resentMessage = mockedMailSender.filterForMessageTo(messageTask.getRecipientEmail());
		assertThat(resentMessage).isNotNull();
	}

	private void addParticipant(RunningDinner runningDinner) {
		Participant participant = ParticipantGenerator.generateParticipants(1).getFirst();
		participant.setEmail("jane@example.com");
		participantService.addParticipant(runningDinner, new ParticipantInputDataTO(participant), false);
	}

	private MessageTask findParticipantMessageTask(RunningDinner runningDinner) {
		List<MessageTask> messageTasks = messageTaskRepository.findByAdminId(runningDinner.getAdminId());
		return messageTasks
						.stream()
						.filter(mt -> mt.getParentJob().getMessageType() == MessageType.PARTICIPANT)
						.findFirst()
						.orElseThrow();
	}
}
