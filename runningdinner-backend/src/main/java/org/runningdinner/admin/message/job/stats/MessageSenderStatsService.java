package org.runningdinner.admin.message.job.stats;

import org.jetbrains.annotations.NotNull;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class MessageSenderStatsService {

	private final MessageTaskRepository messageTaskRepository;

  public MessageSenderStatsService(MessageTaskRepository messageTaskRepository) {
    this.messageTaskRepository = messageTaskRepository;
  }

  public MessageSenderStats getStatsBySender(LocalDate now) {

		Map<String, List<MessageTaskSenderInfo>> senderInfosOfCurrentMonth = findSenderInfosInCurrentMonth(now);

		Map<String, Integer> sentTasksOfMonthCount = new HashMap<>();
		for (Map.Entry<String, List<MessageTaskSenderInfo>> entry : senderInfosOfCurrentMonth.entrySet()) {
			sentTasksOfMonthCount.put(entry.getKey(), entry.getValue().size());
		}

		Map<String, Integer> sentTasksOfDayCount = new HashMap<>();
		senderInfosOfCurrentMonth.forEach((sender, infos) -> {
			long countForCurrentDay = infos.stream().filter(info -> isCurrentDay(info, now)).count();
			sentTasksOfDayCount.put(sender, (int) countForCurrentDay);
		});
		
		return new MessageSenderStats(sentTasksOfDayCount, sentTasksOfMonthCount);
	}

	@NotNull
	private Map<String, List<MessageTaskSenderInfo>> findSenderInfosInCurrentMonth(LocalDate now) {
		LocalDateTime startOfMonth = now.atStartOfDay().withDayOfMonth(1);
		LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
		List<MessageTaskSenderInfo> senderInfos = messageTaskRepository.findSenderInfosBySendingStartTimeBetween(startOfMonth, endOfMonth);
		return groupBySender(senderInfos);
	}

	private boolean isCurrentDay(MessageTaskSenderInfo senderInfo, LocalDate now) {
		LocalDate sendingStartDay = senderInfo.getSendingStartTime().toLocalDate();
		return Objects.equals(sendingStartDay, now);
	}

	private Map<String, List<MessageTaskSenderInfo>> groupBySender(List<MessageTaskSenderInfo> senderInfos) {
		Map<String, List<MessageTaskSenderInfo>> result = new HashMap<>();
		for (MessageTaskSenderInfo senderInfo : senderInfos) {
			result.computeIfAbsent(senderInfo.getSender(), k -> new ArrayList<>()).add(senderInfo);
		}
		return result;
	}
}
