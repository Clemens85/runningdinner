package org.runningdinner.mail.ses;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.MailUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.springframework.beans.factory.annotation.Autowired;
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
	"mail.awsses.allow.resend.alternative.provider=false"
})
public class AwsSesEmailSynchronizationServiceTest {

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

	@Autowired
	EventPublisher eventPublisher;

	@Test
	public void successfulDeliveryIsPassedThrough() {
		assertThat(awsSesEmailSynchronizationService.handleSesNotification(AwsSesNotificationExamples.DELIVERY)).isTrue();
	}

	@Test
	public void permanentBounce() {
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

		assertThat(awsSesEmailSynchronizationService.handleSesNotification(AwsSesNotificationExamples.BOUNCE)).isTrue();

		// Verify MessageTask was updated appropriately
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isTrue();
		assertThat(messageTask.getSendingResult().getFailureType()).isEqualTo(FailureType.BLOCKED);
		assertThat(messageTask.getSendingResult().getFailureMessage())
						.contains("Permanent")
						.contains("General")
						.contains("smtp; 550");
		assertThat(messageTask.getSendingResult().getDelieveryFailedDate()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));
	}

	@Test
	public void complaint() {
		// Our notification example contains an entry created (and bounced) at: 2016-01-27T14:59:38.237Z
		LocalDateTime sendingStartTime = MailUtil.parseIsoTimestampToLocalDateTime("2016-01-27T14:59:38.237Z");

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

		assertThat(awsSesEmailSynchronizationService.handleSesNotification(AwsSesNotificationExamples.COMPLAINT)).isTrue();

		// Verify MessageTask was updated appropriately
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isTrue();
		assertThat(messageTask.getSendingResult().getFailureType()).isEqualTo(FailureType.SPAM);
		assertThat(messageTask.getSendingResult().getFailureMessage()).contains("abuse");
		assertThat(messageTask.getSendingResult().getDelieveryFailedDate()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));
	}

	@Test
	public void deliveryWithEventTypeIsProperlyParsed() {

		LocalDateTime sendingStartTime = MailUtil.parseIsoTimestampToLocalDateTime("2016-01-27T14:59:38.237Z");

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

		assertThat(awsSesEmailSynchronizationService.handleSesNotification(AwsSesNotificationExamples.DELIVERY_WITH_EVENT_TYPE)).isTrue();
		// When reaching here we know that parsing was successful
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
