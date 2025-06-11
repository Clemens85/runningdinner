package org.runningdinner.admin.message.job.stats;


import org.apache.commons.lang3.StringUtils;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.*;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class MessageSenderStatsServiceTest {

	private static final int TOTAL_NUMBER_OF_PARTICIPANTS = 22;

	private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

	@Autowired
	private ParticipantService participantService;

	@Autowired
	private MessageService messageService;

	@Autowired
	private MessageTaskRepository messageTaskRepository;

	@Autowired
	private TestHelperService testHelperService;

	@Autowired
	private MailSenderFactory mailSenderFactory;

	@Autowired
	private MessageJobRepository messageJobRepository;

	@Autowired
	private MessageSenderStatsService messageSenderStatsService;

	private MailSenderMockInMemory mailSenderInMemory;

	private RunningDinner runningDinner;

	static final String MOCK = MailProvider.MOCK.toString();

	@BeforeEach
	public void setUp() throws NoPossibleRunningDinnerException {
		this.mailSenderInMemory = testHelperService.getMockedMailSender();
		this.mailSenderInMemory.setUp();
		this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
		awaitAllMessageTasksSent();
		this.messageTaskRepository.deleteAll();
	}

	@Test
	public void statsForOneMailProvider() {

		LocalDate now = LocalDate.now();

		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
		assertThat(participants).hasSize(22);

		assertThat(this.messageTaskRepository.count()).isZero();

		ParticipantMessage participantMessage = new ParticipantMessage();
		participantMessage.setMessage("Message");
		participantMessage.setSubject("Subject");
		participantMessage.setParticipantSelection(ParticipantSelection.ALL);
		MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), participantMessage);
		assertThat(messageJob).isNotNull();

		List<MessageTask> allMessageTasks = messageTaskRepository.findAll();
		assertThat(allMessageTasks).hasSize(22);
		assertThat(allMessageTasks).allMatch(mt -> StringUtils.equals(mt.getSender(), MOCK));

		// Month without any sent tasks
		MessageSenderStats statsBySender = messageSenderStatsService.getStatsBySender(now.minusMonths(2));
		assertThat(statsBySender.getSentTasksOfMonth()).isEmpty();
		assertThat(statsBySender.getSentTasksOfDay()).isEmpty();

		// Current Month
		statsBySender = messageSenderStatsService.getStatsBySender(now);
		assertThat(statsBySender.getSentTasksOfDay()).containsOnlyKeys(MOCK);
		assertThat(statsBySender.getSentTasksOfMonth()).containsOnlyKeys(MOCK);
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(22);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(22);
	}

	public void awaitAllMessageTasksSent() {
		LocalDateTime now = LocalDateTime.now();
		Awaitility
			.await()
			.atMost(5, TimeUnit.SECONDS)
			.until(areAllMessageTasksSent(now));
	}

	private Callable<Boolean> areAllMessageTasksSent(LocalDateTime startOfAwaiting) {
		return () -> {
			List<MessageTask> allMessageTasks = messageTaskRepository.findAll();
			List<MessageTask> notSentMessageTasks = allMessageTasks.stream().filter(mt -> mt.getSendingStatus() != SendingStatus.SENDING_FINISHED).toList();
			if (notSentMessageTasks.isEmpty()) {
				return true;
			}
			// if most recent modified message task was not modified after 4 seconds after start of awaiting return true
			MessageTask mostRecentMessageTask = notSentMessageTasks.stream()
																															.max(Comparator.comparing(AbstractEntity::getModifiedAt))
																															.orElseThrow(() -> new IllegalStateException("No message tasks found"));
			LocalDateTime mostRecentModifiedAt = mostRecentMessageTask.getModifiedAt();
			return mostRecentModifiedAt.plusSeconds(3).isBefore(startOfAwaiting);
		};
	}

}
