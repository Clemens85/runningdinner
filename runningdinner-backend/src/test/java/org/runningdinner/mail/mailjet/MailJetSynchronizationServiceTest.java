package org.runningdinner.mail.mailjet;

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
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class MailJetSynchronizationServiceTest  {

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

	@Autowired
	EventPublisher eventPublisher;

	@Test
	public void successfulDeliveryIsPassedThrough() {
		assertThat(mailJetSynchronizationService.handleMailJetNotification(MailJetExamples.DELIVERY)).isTrue();
	}

	@Test
	public void permanentBounce() {
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

		assertThat(mailJetSynchronizationService.handleMailJetNotification(MailJetExamples.BOUNCE)).isTrue();

		// Verify MessageTask was updated appropriately
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isTrue();
		assertThat(messageTask.getSendingResult().getFailureType()).isEqualTo(FailureType.BOUNCE);
		assertThat(messageTask.getSendingResult().getFailureMessage())
						.contains("Host or domain name not found");
		assertThat(messageTask.getSendingResult().getDelieveryFailedDate()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));
	}

	@Test
	public void complaint() {
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

		assertThat(mailJetSynchronizationService.handleMailJetNotification(MailJetExamples.SPAM)).isTrue();

		// Verify MessageTask was updated appropriately
		messageTask = findParticipantMessageTask(runningDinner);
		assertThat(messageTask.getSendingResult().isDelieveryFailed()).isTrue();
		assertThat(messageTask.getSendingResult().getFailureType()).isEqualTo(FailureType.SPAM);
		assertThat(messageTask.getSendingResult().getFailureMessage()).contains("spam");
		assertThat(messageTask.getSendingResult().getDelieveryFailedDate()).isCloseTo(sendingStartTime, within(10, ChronoUnit.SECONDS));
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
