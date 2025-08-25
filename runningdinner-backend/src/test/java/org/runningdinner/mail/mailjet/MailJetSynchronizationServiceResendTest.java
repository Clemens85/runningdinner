package org.runningdinner.mail.mailjet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.MailProvider;
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
	"mail.awsses.enabled=false"
})
public class MailJetSynchronizationServiceResendTest {

	@Autowired
	private MailJetSynchronizationService mailJetSynchronizationService;

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

		// Our notification example contains an entry created (and bounced) at: June 2015 at 14.19.09 (German time)
		LocalDateTime sendingStartTime = LocalDateTime.of(2015, 6, 3, 14, 19, 9, 0);

		// Simulate MessageTask
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(7), 1);
		addParticipant(runningDinner);
		testHelperService.sendMessagesToAllParticipants(runningDinner);
		MessageTask messageTask = findParticipantMessageTask(runningDinner);
		testHelperService.awaitMessageJobFinished(messageTask.getParentJob());

		// Simulate MessageTask was sent in past with date X and with MAILJET
		testMessageTaskHelperService.updateMessageTaskSenders(List.of(messageTask), MailProvider.MAILJET);
		testMessageTaskHelperService.updateMessageTaskSentDates(List.of(messageTask), sendingStartTime);

		// Ensure we have the proper test base now:
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSender()).isEqualTo(MailProvider.MAILJET.toString());
		assertThat(messageTask.getSendingStartTime()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));

		assertThat(messageTask.getResendCount()).isZero();
		assertThat(messageTask.getOriginalSender()).isNull();
		mockedMailSender.removeAllMessages(); // Clear out the message sent during initial sending

		assertThat(mailJetSynchronizationService.handleMailJetNotification(MailJetExamples.SPAM)).isTrue();

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
		assertThat(messageTask.getOriginalSender()).isEqualTo(MailProvider.MAILJET.toString());

		SimpleMailMessage resentMessage = mockedMailSender.filterForMessageTo(messageTask.getRecipientEmail());
		assertThat(resentMessage).isNotNull();
	}

	@Test
	public void errorOnMessageTaskIsResendingWithAlternativeProvider() {
		MailSenderMockInMemory mockedMailSender = testHelperService.getMockedMailSender();

		// Our notification example contains an entry created (and bounced) at: June 2015 at 14.19.09 (German time)
		LocalDateTime sendingStartTime = LocalDateTime.of(2015, 6, 3, 14, 19, 9, 0);

		// Simulate MessageTask
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(7), 1);
		addParticipant(runningDinner);
		testHelperService.sendMessagesToAllParticipants(runningDinner);
		MessageTask messageTask = findParticipantMessageTask(runningDinner);
		testHelperService.awaitMessageJobFinished(messageTask.getParentJob());

		// Simulate MessageTask was sent in past with date X and with MAILJET
		testMessageTaskHelperService.updateMessageTaskSenders(List.of(messageTask), MailProvider.MAILJET);
		testMessageTaskHelperService.updateMessageTaskSentDates(List.of(messageTask), sendingStartTime);

		// Ensure we have the proper test base now:
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSender()).isEqualTo(MailProvider.MAILJET.toString());
		assertThat(messageTask.getSendingStartTime()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));

		assertThat(messageTask.getResendCount()).isZero();
		assertThat(messageTask.getOriginalSender()).isNull();
		mockedMailSender.removeAllMessages(); // Clear out the message sent during initial sending

		mockedMailSender.addFailingRecipientEmail("jane@example.com");
		assertThat(mailJetSynchronizationService.handleMailJetNotification(MailJetExamples.SPAM)).isTrue();

		// Verify MessageTask was not resent due to error (transaction for resend was rolled back):
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isTrue();
		assertThat(messageTask.getSendingResult().getFailureType()).isEqualTo(FailureType.SPAM);
		assertThat(messageTask.getSendingResult().getFailureMessage()).contains("spam");
		assertThat(messageTask.getResendCount()).isZero();
		assertThat(messageTask.getSender()).isEqualTo(MailProvider.MAILJET.toString());
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
