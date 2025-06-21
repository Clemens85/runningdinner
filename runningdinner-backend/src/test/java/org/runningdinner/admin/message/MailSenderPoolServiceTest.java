package org.runningdinner.admin.message;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.mail.pool.MailSenderLimit;
import org.runningdinner.mail.pool.MailSenderPoolService;
import org.runningdinner.mail.pool.PoolableMailSender;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
@TestPropertySource(properties = {
	"mail.aws.ses.enabled=true",
	"mail.aws.ses.username=username",
	"mail.aws.ses.password=password",
	"mail.aws.ses.limit.monthly=4",
	"mail.aws.ses.fallback=true",
	"mail.junit.limit.monthly=2",
	"mail.junit.limit.daily=1",
	"mail.junit.priority=10"
})
public class MailSenderPoolServiceTest {

	@Autowired
	private TestMessageTaskHelperService testMessageTaskHelperService;

	@Autowired
	private MailSenderPoolService mailSenderPoolService;

	@Autowired
	private MessageTaskRepository messageTaskRepository;

	@Autowired
	private TestHelperService testHelperService;

	@Autowired
	private ParticipantService participantService;

	@Autowired
	EventPublisher eventPublisher;

	private MailSenderMockInMemory mailSenderInMemory;

	@BeforeEach
	public void setUp() {
		this.testMessageTaskHelperService.awaitAllMessageTasksSent();
		this.messageTaskRepository.deleteAll();
		this.mailSenderInMemory = testHelperService.getMockedMailSender();
		this.mailSenderInMemory.setUp();
	}

	@Test
	public void getMailSenderToUseWithEmptyStats() {
		LocalDate now = LocalDate.now();

		PoolableMailSender result = mailSenderPoolService.getMailSenderToUse(now, 3);
		assertThat(result.getKey()).isEqualTo(MailProvider.AWS_SES_API);
		assertThat(result.getMailSender()).isNotNull();
		assertThat(result.getMailSenderLimit()).isEqualTo(new MailSenderLimit(-1, 4));

		// This fits into our junit mock and due to this has the highest priority, it should be the first one picked
		result = mailSenderPoolService.getMailSenderToUse(now, 1);
		assertThat(result.getKey()).isEqualTo(MailProvider.MOCK);

		// This is not fitting, just use the fallback in our list
		result = mailSenderPoolService.getMailSenderToUse(now, 20);
		assertThat(result.getKey()).isEqualTo(MailProvider.AWS_SES_API);
	}

	@Test
	public void getMailSenderWithHighestPriority() {
		List<PoolableMailSender> matchingMailSenders = new ArrayList<>(List.of(
				newPoolableMailSenderMock(MailProvider.AWS_SES_API, -1, 4, 0, false),
				newPoolableMailSenderMock(MailProvider.MOCK, -1, 2, -1, false)
		));

		var result = MailSenderPoolService.getMailSenderWithHighestPriority(matchingMailSenders);
		assertThat(result).isNull();

		matchingMailSenders.add(newPoolableMailSenderMock(MailProvider.MAILJET_API, -1, 4, 5, true));
		result = MailSenderPoolService.getMailSenderWithHighestPriority(matchingMailSenders);
		assertThat(result).isNotNull();
		assertThat(result.getKey()).isEqualTo(MailProvider.MAILJET_API);
	}

	@Test
	public void messageTasksAreDistributedToMailSenders() {

		assertThat(mailSenderInMemory.getMessages()).isEmpty();

		// 1st message is sent with the highest priority mailsender
		RunningDinner runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(7), 1);
		List<MessageTask> messageTasks = messageTaskRepository.findByAdminId(runningDinner.getAdminId());
		MessageTask firstSentMessageTask = messageTasks.getFirst();
		assertThat(firstSentMessageTask.getSender()).isEqualTo(MailProvider.MOCK.toString());

		testHelperService.awaitMessageJobFinished(firstSentMessageTask.getParentJob());
		assertThat(mailSenderInMemory.getMessages()).hasSize(1);

		addParticipants(runningDinner, 4, 0);
		// Next 4 messages are sent with SES due to MOCK is exhausted
		messageTasks = findParticipantSubscriptionMessageTasks(runningDinner.getAdminId());
		assertThat(messageTasks).hasSize(4);
		assertThat(messageTasks).allMatch(mt -> mt.getSender().equals(MailProvider.AWS_SES_API.toString()));

		addParticipants(runningDinner, 1, 4);
		// The 6th message is sent with SES due to it is configured as fallback (actually no one fits any longer)
		messageTasks = findParticipantSubscriptionMessageTasks(runningDinner.getAdminId());
		assertThat(messageTasks).hasSize(5);
		assertThat(messageTasks).allMatch(mt -> mt.getSender().equals(MailProvider.AWS_SES_API.toString()));

		// We simulate that the first message was sent two days before, so we should be able to use one MOCK message again (daily <-> monthly limit)
		testMessageTaskHelperService.updateMessageTaskSentDates(List.of(firstSentMessageTask), LocalDateTime.now().minusDays(2));

		addParticipants(runningDinner, 1, 5);
		messageTasks = findParticipantSubscriptionMessageTasks(runningDinner.getAdminId());
		assertThat(messageTasks).hasSize(6);
		Set<MailProvider> senders = messageTasks.stream().map(MessageTask::getSender).map(MailProvider::valueOf).collect(Collectors.toSet());
		assertThat(senders).containsExactlyInAnyOrder(MailProvider.AWS_SES_API, MailProvider.MOCK);

		MessageTask lastMessageTask = messageTasks.stream().filter(mt -> mt.getSender().equals(MailProvider.MOCK.toString())).findFirst().orElseThrow();
		testHelperService.awaitMessageJobFinished(lastMessageTask.getParentJob());
		assertThat(mailSenderInMemory.getMessages()).hasSize(2);
	}

	private List<MessageTask> findParticipantSubscriptionMessageTasks(String adminId) {
		var messageTasks = messageTaskRepository.findByAdminId(adminId);
		return messageTasks.stream()
						.filter(mt -> mt.getParentJob().getMessageType() == MessageType.PARTICIPANT_SUBSCRIPTION_ACTIVATION)
						.toList();
	}

	private void addParticipants(RunningDinner runningDinner, int numberOfParticipants, int offset) {
		List<Participant> participantsSentFromSES = ParticipantGenerator.generateParticipants(numberOfParticipants, offset);
		participantsSentFromSES.forEach(p -> {
			Participant participant = participantService.addParticipant(runningDinner, new ParticipantInputDataTO(p), true);
			eventPublisher.notifyNewParticipant(participant, runningDinner);
		});
	}

	private PoolableMailSender newPoolableMailSenderMock(MailProvider mailProvider, int dailyLimit, int monthlyLimit, int priority, boolean fallback) {
		return new PoolableMailSender(mailProvider, null, new MailSenderLimit(dailyLimit, monthlyLimit), "foo@bar.de", priority, fallback);
	}

}
