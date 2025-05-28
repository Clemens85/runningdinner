package org.runningdinner.mail;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.message.job.stats.MessageSenderStats;
import org.runningdinner.admin.message.job.stats.MessageSenderStatsService;
import org.runningdinner.mail.pool.PoolableMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MailSenderPoolService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MailSenderPoolService.class);
	
	private MessageSenderStatsService messageJobStatsService;
	
	private List<PoolableMailSender> mailSenderPool = new ArrayList<>();
	
	protected void initMailSenders() {
		// TODO
	}
	
	public PoolableMailSender getMailSenderToUse(LocalDate now, int numMessageTasksToSend) {
		List<PoolableMailSender> matchingMailSenders = getMatchingMailSenders(now, numMessageTasksToSend);
		return getBestFittingSender(matchingMailSenders);
	}
	
	private PoolableMailSender getBestFittingSender(List<PoolableMailSender> matchingMailSenders) {
		if (CollectionUtils.isEmpty(matchingMailSenders)) {
			LOGGER.error("Could not find any matching mail sender to use, so fallback to the first configured one");
			return mailSenderPool.get(0);
		}
		// TODO Improve Implementation
		return matchingMailSenders.get(0);
	}

	protected List<PoolableMailSender> getMatchingMailSenders(LocalDate now, int numMessageTasksToSend) {
	
		List<PoolableMailSender> result = new ArrayList<>();
		
		MessageSenderStats stats = messageJobStatsService.getStatsBySender(now);
		
		for (PoolableMailSender poolableMailSender : mailSenderPool) {
			if (poolableMailSender.hasDailyLimit()) {
				int sentTasksOfDay = stats.getSentTasksOfDay(poolableMailSender.getKey());
				if (sentTasksOfDay + numMessageTasksToSend > poolableMailSender.getDailyLimit()) {
					continue;
				}
			}
			if (poolableMailSender.hasMonthlyLimit()) {
				int sentTasksOfMonth = stats.getSentTasksOfMonth(poolableMailSender.getKey());
				if (sentTasksOfMonth + numMessageTasksToSend > poolableMailSender.getMonthlyLimit()) {
					continue;
				}	
			}
			result.add(poolableMailSender);
		}
		
		return result;
	}
}
