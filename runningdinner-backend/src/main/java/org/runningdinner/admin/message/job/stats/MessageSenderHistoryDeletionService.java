package org.runningdinner.admin.message.job.stats;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageSenderHistoryDeletionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessageSenderHistoryDeletionService.class);

  private final MessageSenderHistoryRepository messageSenderHistoryRepository;

  public MessageSenderHistoryDeletionService(MessageSenderHistoryRepository messageSenderHistoryRepository) {
    this.messageSenderHistoryRepository = messageSenderHistoryRepository;
  }

  /**
   * Deletes all MessageSenderHistory entries that are older than the specified date
   * 
   * @param cutoffDate The date before which all entries will be deleted
   * @return The number of deleted entries
   */
  @Transactional
  public int deleteMessageSenderHistoryBefore(LocalDateTime cutoffDate) {
    
    LOGGER.info("Starting deletion of MessageSenderHistory entries older than {}", cutoffDate);
    
    List<MessageSenderHistory> entriesToDelete = messageSenderHistoryRepository.findMessageSenderHistoryBefore(cutoffDate);
    
    if (entriesToDelete.isEmpty()) {
      LOGGER.info("No MessageSenderHistory entries found to delete before {}", cutoffDate);
      return 0;
    }
    
    int deletedCount = entriesToDelete.size();
    LOGGER.info("Found {} MessageSenderHistory entries to delete before {}", deletedCount, cutoffDate);
    
    messageSenderHistoryRepository.deleteAll(entriesToDelete);
    
    LOGGER.info("Successfully deleted {} MessageSenderHistory entries", deletedCount);
    return deletedCount;
  }

  /**
   * Calculates the cutoff date for deletion (3 months ago from the given date)
   * 
   * @param now The current date/time
   * @return The cutoff date for deletion
   */
  public LocalDateTime calculateCutoffDateForDeletion(LocalDateTime now) {
    return now.minusMonths(3);
  }
}
