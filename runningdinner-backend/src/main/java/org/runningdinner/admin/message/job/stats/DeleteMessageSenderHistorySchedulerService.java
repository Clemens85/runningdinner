package org.runningdinner.admin.message.job.stats;

import net.javacrumbs.shedlock.core.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DeleteMessageSenderHistorySchedulerService {

  private static final Logger LOGGER = LoggerFactory.getLogger(DeleteMessageSenderHistorySchedulerService.class);

  private final boolean schedulerEnabled;
  private final MessageSenderHistoryDeletionService messageSenderHistoryDeletionService;

  public DeleteMessageSenderHistorySchedulerService(MessageSenderHistoryDeletionService messageSenderHistoryDeletionService,
                                                   @Value("${delete.message.sender.history.scheduler.enabled:true}") boolean schedulerEnabled) {
    this.messageSenderHistoryDeletionService = messageSenderHistoryDeletionService;
    this.schedulerEnabled = schedulerEnabled;
  }

  /**
   * Perform job each 12 hours
   */
  @Scheduled(fixedRate = 1000 * 60 * 60 * 12)
  @SchedulerLock(name = "triggerDeleteOldMessageSenderHistory")
  public void triggerDeleteOldMessageSenderHistory() {

    if (!schedulerEnabled) {
      LOGGER.warn("triggerDeleteOldMessageSenderHistory scheduler is disabled!");
      return;
    }

    try {
      deleteOldMessageSenderHistory(LocalDateTime.now());
    } catch (RuntimeException e) {
      LOGGER.error("deleteOldMessageSenderHistory failed unexpectedly", e);
    }
  }

  public void deleteOldMessageSenderHistory(LocalDateTime now) {
    
    LocalDateTime cutoffDate = messageSenderHistoryDeletionService.calculateCutoffDateForDeletion(now);
    
    LOGGER.info("Starting deletion of MessageSenderHistory entries older than {} (3 months ago)", cutoffDate);
    
    int deletedCount = messageSenderHistoryDeletionService.deleteMessageSenderHistoryBefore(cutoffDate);
    
    LOGGER.info("Completed deletion job: {} MessageSenderHistory entries deleted", deletedCount);
  }
}
