package org.runningdinner.admin.message.job.stats;

import org.runningdinner.admin.message.job.MessageTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class MessageSenderHistoryService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessageSenderHistoryService.class);

  private final MessageSenderHistoryRepository messageSenderHistoryRepository;
	private final MessageSenderHistoryService self;

	public MessageSenderHistoryService(MessageSenderHistoryRepository messageSenderHistoryRepository, @Lazy MessageSenderHistoryService self) {
		this.messageSenderHistoryRepository = messageSenderHistoryRepository;
		this.self = self;
	}

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public List<MessageSenderHistory> saveMessageSenderHistory(List<MessageTask> messageTasks) {
    List<MessageSenderHistory> messageSenderHistoryList = messageTasks.stream()
                                                            .map(this::convertToMessageSenderHistory)
                                                            .toList();
    return messageSenderHistoryRepository.saveAll(messageSenderHistoryList);
  }

  public List<MessageSenderHistory> saveMessageSenderHistorySafe(List<MessageTask> messageTasks) {
    try {
      return self.saveMessageSenderHistory(messageTasks);
    } catch (Exception e) {
      LOGGER.error("Error while saving message sender history", e);
      return Collections.emptyList();
    }
  }

  private MessageSenderHistory convertToMessageSenderHistory(MessageTask messageTask) {
    return new MessageSenderHistory(
            messageTask.getSender(),
            messageTask.getSendingStartTime() != null ? messageTask.getSendingStartTime() : LocalDateTime.now(),
            1
    );
  }
}
