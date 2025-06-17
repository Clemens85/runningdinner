package org.runningdinner.test.util;

import org.awaitility.Awaitility;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.core.AbstractEntity;
import org.runningdinner.mail.MailProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

@Service
public class TestMessageTaskHelperService {

	private final MessageTaskRepository messageTaskRepository;

	private final JdbcTemplate jdbcTemplate;

	public TestMessageTaskHelperService(MessageTaskRepository messageTaskRepository, DataSource dataSource) {
		this.messageTaskRepository = messageTaskRepository;
		this.jdbcTemplate = new JdbcTemplate(dataSource);
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

	public List<MessageTask> updateMessageTaskSenders(List<MessageTask> messageTasks, MailProvider mailProvider) {
		String sql = "UPDATE runningdinner.MessageTask SET sender = ?, sendingStatus = ? WHERE id = ?";
		for (MessageTask messageTask : messageTasks) {
			jdbcTemplate.update(sql, mailProvider.toString(), SendingStatus.SENDING_FINISHED.toString(), messageTask.getId());
		}
		return messageTaskRepository.findAllById(messageTasks.stream().map(MessageTask::getId).toList());
	}

	public List<MessageTask> updateMessageTaskSentDates(List<MessageTask> messageTasksLastMonth, LocalDateTime date) {
		String sql = "UPDATE runningdinner.MessageTask SET createdAt = ?, modifiedAt = ?, sendingStartTime = ?, sendingEndTime = ?, sendingStatus = ? WHERE id = ?";
		for (MessageTask messageTask : messageTasksLastMonth) {
			jdbcTemplate.update(sql, date, date, date, date, SendingStatus.SENDING_FINISHED.toString(), messageTask.getId());
		}
		return messageTaskRepository.findAllById(messageTasksLastMonth.stream().map(MessageTask::getId).toList());
	}

}
