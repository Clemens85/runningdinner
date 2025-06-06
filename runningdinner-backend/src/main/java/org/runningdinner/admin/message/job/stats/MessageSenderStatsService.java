package org.runningdinner.admin.message.job.stats;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.springframework.stereotype.Service;

@Service
public class MessageSenderStatsService {

	private final MessageTaskRepository messageTaskRepository;

  public MessageSenderStatsService(MessageTaskRepository messageTaskRepository) {
    this.messageTaskRepository = messageTaskRepository;
  }

  public MessageSenderStats getStatsBySender(LocalDate now) {
		
		LocalDateTime startOfMonth = now.atStartOfDay().withDayOfMonth(1);
		LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
		
		List<MessageTaskBySenderCount> counts = messageTaskRepository.findMessageTaskBySenderCounts(startOfMonth, endOfMonth);
		
		Map<String, Integer> sentTasksOfMonth = groupCountsBySender(counts);
		List<MessageTaskBySenderCount> countsForCurrentDay = counts
																													.stream()
																													.filter(c -> isCurrentDay(c, now))
																													.collect(Collectors.toList());
		Map<String, Integer> sentTasksOfDay = groupCountsBySender(countsForCurrentDay);
		return new MessageSenderStats(sentTasksOfDay, sentTasksOfMonth);
	}
	
	private boolean isCurrentDay(MessageTaskBySenderCount c, LocalDate now) {
		LocalDate sendingStartDay = c.getSendingStartTime().toLocalDate();
		return Objects.equals(sendingStartDay, now);
	}

	private Map<String, Integer> groupCountsBySender(List<MessageTaskBySenderCount> counts) {
		Map<String, Integer> result = new HashMap<>();
		for (MessageTaskBySenderCount count : counts) {
			result.compute(count.getSender(), (k, v) -> v == null ? 1 : v++);
		}
		return result;
	}
}
