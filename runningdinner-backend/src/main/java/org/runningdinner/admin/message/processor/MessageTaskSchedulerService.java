package org.runningdinner.admin.message.processor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import net.javacrumbs.shedlock.core.SchedulerLock;

@Service
public class MessageTaskSchedulerService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessageTaskSchedulerService.class);
  
  @Value("${send.queued.messagetasks.scheduler.enabled:true}")
  private boolean schedulerEnabled = true;
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private MessageJobBatchProcessorService messageJobBatchProcessorService;
  
  /**
   * Perform job each 15 minutes
   */
  @Scheduled(fixedRate = 1000 * 60 * 15)
  @SchedulerLock(name = "triggerQueuedMessageTasks")
  public void triggerSendingOfQeuedMessageTasks() {
    
    if (schedulerEnabled) {
      sendQeuedMessageTasks(LocalDateTime.now());
    }
  }

  public void sendQeuedMessageTasks(LocalDateTime now) {
    
    LOGGER.info("Running through sendQeuedMessageTasks");
    
    LocalDateTime lastModifiedDateBefore = now.minusMinutes(15);
    
    List<MessageTask> allQueuedMessageTasks = messageService.findQueuedMessageTasksLastModifiedBefore(lastModifiedDateBefore);
    
    LOGGER.info("Found {} queued messagetasks that are older than {}", allQueuedMessageTasks.size(), lastModifiedDateBefore);
    
    Map<UUID, List<MessageTask>> qeuedMessageTasksByParentJob = allQueuedMessageTasks
                                                                  .stream()
                                                                  .collect(Collectors.groupingBy(MessageTask::getParentJobId));
    
    for (Entry<UUID, List<MessageTask>> queuedMessageTasksPerParentJob : qeuedMessageTasksByParentJob.entrySet()) {
      List<MessageTask> queuedMessageTasks = queuedMessageTasksPerParentJob.getValue();
      processQeuedMessageTasks(queuedMessageTasks);
    }
    
  }

  private void processQeuedMessageTasks(List<MessageTask> queuedMessageTasks) {

    try {
      if (CollectionUtils.isEmpty(queuedMessageTasks)) {
        return;
      }
      
      UUID parentJobId = queuedMessageTasks.get(0).getParentJobId();
      
      for (MessageTask queuedMessageTask : queuedMessageTasks) {
        LOGGER.info("Trying to send queued task {}", queuedMessageTask);
        messageJobBatchProcessorService.processMessageTask(queuedMessageTask);
      }
  
      messageService.markMessageJobSuccessfulIfAllMessageTasksSucceededInNewTransaction(parentJobId);
    } catch (Exception ex) {
      LOGGER.error("Unexpected error while processing queued message tasks {}", queuedMessageTasks, ex);
    }
  }
  
}
