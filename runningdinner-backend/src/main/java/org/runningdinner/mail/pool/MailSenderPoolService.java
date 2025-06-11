package org.runningdinner.mail.pool;

import jakarta.annotation.PostConstruct;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.job.stats.MessageSenderStats;
import org.runningdinner.admin.message.job.stats.MessageSenderStatsService;
import org.runningdinner.mail.MailSenderFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MailSenderPoolService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MailSenderPoolService.class);
	
	private final MessageSenderStatsService messageJobStatsService;
	
	private List<PoolableMailSender> mailSenderPool;

	private final MailSenderFactory mailSenderFactory;

  public MailSenderPoolService(MessageSenderStatsService messageJobStatsService, MailSenderFactory mailSenderFactory) {
    this.messageJobStatsService = messageJobStatsService;
    this.mailSenderFactory = mailSenderFactory;
  }

  @PostConstruct
	protected void initMailSenders() {
		this.mailSenderPool = mailSenderFactory.getConfiguredMailSenders();
	}
	
	public PoolableMailSender getMailSenderToUse(LocalDate now, int numMessageTasksToSend) {
		Assert.notEmpty(this.mailSenderPool, "Mail sender pool must not be empty");
		List<PoolableMailSender> matchingMailSenders = getMatchingMailSenders(now, numMessageTasksToSend);
		return getBestFittingSender(matchingMailSenders);
	}
	
	private PoolableMailSender getBestFittingSender(List<PoolableMailSender> matchingMailSenders) {
		if (CollectionUtils.isEmpty(matchingMailSenders)) {
			LOGGER.error("Could not find any matching mail sender to use, so fallback to the first configured one");
			return mailSenderPool.getFirst();
		}
		// TODO Improve Implementation
		return matchingMailSenders.getFirst();
	}

	protected List<PoolableMailSender> getMatchingMailSenders(LocalDate now, int numMessageTasksToSend) {
	
		List<PoolableMailSender> result = new ArrayList<>();
		
		MessageSenderStats stats = messageJobStatsService.getStatsBySender(now);
		
		for (PoolableMailSender poolableMailSender : mailSenderPool) {
			if (poolableMailSender.hasDailyLimit()) {
				int sentTasksOfDay = stats.getSentTasksOfDay(poolableMailSender.getKey().toString());
				if (sentTasksOfDay + numMessageTasksToSend > poolableMailSender.getMailSenderLimit().getDailyLimit()) {
					continue;
				}
			}
			if (poolableMailSender.hasMonthlyLimit()) {
				int sentTasksOfMonth = stats.getSentTasksOfMonth(poolableMailSender.getKey().toString());
				if (sentTasksOfMonth + numMessageTasksToSend > poolableMailSender.getMailSenderLimit().getMonthlyLimit()) {
					continue;
				}	
			}
			result.add(poolableMailSender);
		}
		
		return result;
	}

	public PoolableMailSender getMailSenderByKey(String sender) {
		return this.mailSenderPool.stream()
						.filter(mailSender -> StringUtils.equals(mailSender.getKey().toString(), sender))
						.findFirst()
						.orElseThrow(() -> new IllegalArgumentException("No mail sender found for key: " + sender));
	}
}
