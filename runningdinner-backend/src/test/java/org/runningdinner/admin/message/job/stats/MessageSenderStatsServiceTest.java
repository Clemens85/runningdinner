package org.runningdinner.admin.message.job.stats;


import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.feedback.Feedback;
import org.runningdinner.feedback.FeedbackService;
import org.runningdinner.mail.MailProvider;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
	private MessageSenderStatsService messageSenderStatsService;

	@Autowired
	private TestHelperService testHelperService;

	@Autowired
	private MessageSenderHistoryRepository messageSenderHistoryRepository;

	@Autowired
	private TestMessageTaskHelperService testMessageTaskHelperService;

	@Autowired
	private FeedbackService feedbackService;

	private RunningDinner runningDinner;

	static final String MOCK = MailProvider.MOCK.toString();

	@BeforeEach
	public void setUp() throws NoPossibleRunningDinnerException {
		this.runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, TOTAL_NUMBER_OF_PARTICIPANTS);
		this.testMessageTaskHelperService.awaitAllMessageTasksSent();
		this.testMessageTaskHelperService.clearHistoricalMessageTasks();
	}

	@Test
	public void statsForOneMailProvider() {

		LocalDate now = LocalDate.now();

		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
		assertThat(participants).hasSize(22);

		assertThat(this.messageTaskRepository.count()).isZero();

		testHelperService.sendMessagesToAllParticipants(runningDinner);

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

		LocalDateTime previousMonth = now.minusMonths(1).minusDays(1).atStartOfDay();
		var messageTasksLastMonth = List.of(allMessageTasks.get(0), allMessageTasks.get(1));
		messageTasksLastMonth = testMessageTaskHelperService.updateMessageTaskSentDates(messageTasksLastMonth, previousMonth);
		assertThat(messageTasksLastMonth.getFirst().getCreatedAt()).isEqualToIgnoringNanos(previousMonth);

		statsBySender = messageSenderStatsService.getStatsBySender(now);
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(20);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(20);

		int otherDayInMonth = now.getDayOfMonth() == 15 ? 16 : 15;
		statsBySender = messageSenderStatsService.getStatsBySender(now.withDayOfMonth(otherDayInMonth));
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(20);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(0);

		statsBySender = messageSenderStatsService.getStatsBySender(previousMonth.toLocalDate());
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(2);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(2);
	}

	@Test
	public void statsForTwoMailProviders() {

		LocalDate now = LocalDate.now();

		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
		assertThat(participants).hasSize(22);

		assertThat(this.messageTaskRepository.count()).isZero();

		testHelperService.sendMessagesToAllParticipants(runningDinner);

		List<MessageTask> allMessageTasks = messageTaskRepository.findAll();

		var messageTasksMailJet = List.of(allMessageTasks.get(0), allMessageTasks.get(1), allMessageTasks.get(2), allMessageTasks.get(3));
		testMessageTaskHelperService.updateMessageTaskSenders(messageTasksMailJet, MailProvider.MAILJET);

		MessageSenderStats statsBySender = messageSenderStatsService.getStatsBySender(now);
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(18);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(18);
		assertThat(statsBySender.getSentTasksOfMonth(MailProvider.MAILJET.toString())).isEqualTo(4);
		assertThat(statsBySender.getSentTasksOfDay(MailProvider.MAILJET.toString())).isEqualTo(4);
	}

	@Test
	public void statsWithHistory() {

		LocalDate now = LocalDate.now();

		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
		assertThat(participants).hasSize(22);

		assertThat(this.messageTaskRepository.count()).isZero();

		testHelperService.sendMessagesToAllParticipants(runningDinner);
		List<MessageTask> allMessageTasks = messageTaskRepository.findAll();

		var messageTasksMailJet = List.of(allMessageTasks.get(0), allMessageTasks.get(1), allMessageTasks.get(2), allMessageTasks.get(3));
		testMessageTaskHelperService.updateMessageTaskSenders(messageTasksMailJet, MailProvider.MAILJET);

		MessageSenderStats statsBySender = messageSenderStatsService.getStatsBySender(now);
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(18);
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(18);
		assertThat(statsBySender.getSentTasksOfMonth(MailProvider.MAILJET.toString())).isEqualTo(4);
		assertThat(statsBySender.getSentTasksOfDay(MailProvider.MAILJET.toString())).isEqualTo(4);

		Feedback feedback = feedbackService.createFeedback(newFeedback());
		feedbackService.deliverFeedbackInNewTransaction(feedback);
		statsBySender = messageSenderStatsService.getStatsBySender(now);
		assertThat(statsBySender.getSentTasksOfMonth(MOCK)).isEqualTo(19); // +1 Feedback
		assertThat(statsBySender.getSentTasksOfDay(MOCK)).isEqualTo(19); // +1 Feedback
		assertThat(statsBySender.getSentTasksOfMonth(MailProvider.MAILJET.toString())).isEqualTo(4);
		assertThat(statsBySender.getSentTasksOfDay(MailProvider.MAILJET.toString())).isEqualTo(4);

		List<MessageSenderHistory> senderHistoryEntities = messageSenderHistoryRepository
																													.findAllBySendingDateBetween(LocalDateTime.now().minusSeconds(10), LocalDateTime.now().plusSeconds(1));
		assertThat(senderHistoryEntities).hasSize(1);
		assertThat(senderHistoryEntities.getFirst().getAmount()).isOne();
	}

	private static Feedback newFeedback() {
		Feedback feedback = new Feedback();
		feedback.setMessage("Foo");
		feedback.setSenderEmail("feedback@example.com");
		feedback.setSenderIp("127.0.0.1");
		return feedback;
	}

}
