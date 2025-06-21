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
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

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
		Assert.state(CollectionUtils.isNotEmpty(mailSenderPool), "Must have at least one configured mailsender");
	}

	public List<PoolableMailSender> getAllConfiguredMailSenders() {
		return Collections.unmodifiableList(this.mailSenderPool);
	}

	public PoolableMailSender getMailSenderToUse(LocalDate now, int numMessageTasksToSend) {
		Assert.notEmpty(this.mailSenderPool, "Mail sender pool must not be empty");
		List<PoolableMailSender> matchingMailSenders = getMatchingMailSenders(now, numMessageTasksToSend);
		return getBestFittingSender(matchingMailSenders);
	}
	
	private PoolableMailSender getBestFittingSender(List<PoolableMailSender> matchingMailSenders) {
		if (CollectionUtils.isEmpty(matchingMailSenders)) {
			LOGGER.error("Could not find any matching mail sender to use, so use fallback");
			return getFallback();
		}

		if (matchingMailSenders.size() == 1) {
			return matchingMailSenders.getFirst();
		}

		PoolableMailSender result = getMailSenderWithHighestPriority(matchingMailSenders);
		if (result == null) {
			// Randomly select one of the matching mail senders
			int randomIndex = ThreadLocalRandom.current().nextInt(matchingMailSenders.size());
			result = matchingMailSenders.get(randomIndex);
		}
		return result;
	}

	public static PoolableMailSender getMailSenderWithHighestPriority(List<PoolableMailSender> matchingMailSenders) {

		Set<Integer> priorities = matchingMailSenders
																	.stream()
																	.map(PoolableMailSender::getPriority)
																	.map(priority -> priority < 0 ? 0 : priority)
																	.collect(Collectors.toSet());
		if (priorities.size() < 2) {
			return null;
		}

		PoolableMailSender result = null;
		for (PoolableMailSender matchingMailSender : matchingMailSenders) {
			if (matchingMailSender.getPriority() > 0 && result == null) {
				result = matchingMailSender;
				continue;
			}
			if (result != null && matchingMailSender.getPriority() > result.getPriority()) {
				result = matchingMailSender;
			}
		}
		return result;
	}

	private PoolableMailSender getFallback() {
		return mailSenderPool.stream()
						.filter(PoolableMailSender::isFallback)
						.findFirst()
						.orElse(mailSenderPool.getFirst());
	}

	protected List<PoolableMailSender> getMatchingMailSenders(LocalDate now, int numMessageTasksToSend) {
	
		List<PoolableMailSender> result = new ArrayList<>();
		
		MessageSenderStats stats = messageJobStatsService.getStatsBySender(now);
		
		for (PoolableMailSender poolableMailSender : mailSenderPool) {
			if (poolableMailSender.hasDailyLimit()) {
				int sentTasksOfDay = stats.getSentTasksOfDay(poolableMailSender.getKey().toString());
				if (sentTasksOfDay + numMessageTasksToSend > poolableMailSender.getMailSenderLimit().dailyLimit()) {
					continue;
				}
			}
			if (poolableMailSender.hasMonthlyLimit()) {
				int sentTasksOfMonth = stats.getSentTasksOfMonth(poolableMailSender.getKey().toString());
				if (sentTasksOfMonth + numMessageTasksToSend > poolableMailSender.getMailSenderLimit().monthlyLimit()) {
					continue;
				}	
			}
			result.add(poolableMailSender);
		}
		
		return result;
	}

	public PoolableMailSender getMailSenderByKey(String sender) {
		PoolableMailSender result = this.mailSenderPool.stream()
						.filter(mailSender -> StringUtils.equals(mailSender.getKey().toString(), sender))
						.findFirst()
						.orElse(null);

		if (result == null) {
			LOGGER.error("No mail sender found for key {}. Recalculating new one...", sender);
			result = this.getMailSenderToUse(LocalDate.now(), 1);
			Assert.notNull(result, "No mail sender found after all, this should never happen...");
			LOGGER.info("Using now {} instead of {}", result.getKey(), sender);
		}
		return result;
	}
}
