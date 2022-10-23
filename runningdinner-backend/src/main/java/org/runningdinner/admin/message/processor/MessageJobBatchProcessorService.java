package org.runningdinner.admin.message.processor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.common.exception.MessageAbuseSuspicionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class MessageJobBatchProcessorService {

  @Value("${message.max-allowed-tasks-per-job}")
  private int maxAllowedTasksPerJob;

  @Value("${message.max-allowed-tasks-per-dinner}")
  private int maxAllowedTasksPerDinner;
  
  private static final Logger LOGGER = LoggerFactory.getLogger(MessageJobBatchProcessorService.class);
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private MessageJobSingleProcessorService messageTaskSenderService;
  
  @EventListener
  public void handleMessageJob(MessageJob messageJob) {
    
    processMessageJob(messageJob);
  }
  
  public void processMessageJob(MessageJob incomingMessageJob) {
    
    LOGGER.info("Processing {}", incomingMessageJob);
    
    MessageJob messageJob;
    try {
      messageJob = messageTaskSenderService.markMessageJobSendingStartedInNewTransaction(incomingMessageJob);
    } catch (Exception ex) {
      messageTaskSenderService.markMessageJobSendingFinishedInNewTransaction(incomingMessageJob, ex);
      return;
    }
    
    LOGGER.info("Find messagetasks that must be sent for {}", messageJob);
    PageRequest pageable = PageRequest.of(0, maxAllowedTasksPerJob, Sort.by("createdAt").ascending());
    Page<MessageTask> messageTaskPage = messageTaskRepository.findBySendingStatusAndParentJobId(SendingStatus.QUEUED, incomingMessageJob.getId(), pageable);
    List<MessageTask> messageTasks = messageTaskPage.getContent() == null ? Collections.emptyList() : messageTaskPage.getContent();
      
    LOGGER.info("Found {} messagetasks for {}", messageTasks.size(), messageJob);
    
    checkNoMessageAbuse(messageJob, messageTaskPage);
    
    List<MessageTask> processedMessageTasks = new ArrayList<>();
    for (MessageTask messageTask : messageTasks) {
      processedMessageTasks.add(processMessageTask(messageTask));
    }
    
    messageTaskSenderService.markMessageJobSendingFinishedInNewTransaction(messageJob, processedMessageTasks);
  }

  private void checkNoMessageAbuse(MessageJob messageJob, Page<MessageTask> messageTaskPage) {

    boolean messageAbuseDetected = messageTaskPage.getNumberOfElements() >= maxAllowedTasksPerJob && messageTaskPage.hasNext();
      
    if (!messageAbuseDetected) {
      long totalNumberOfMessageTasksNotFailed = messageTaskRepository.countByAdminIdAndSendingResultDelieveryFailed(messageJob.getAdminId(), false);
      messageAbuseDetected = totalNumberOfMessageTasksNotFailed > maxAllowedTasksPerDinner;
    }

    if (messageAbuseDetected) {
      handleMessageAbuseDetection(messageJob, messageTaskPage);
    }
    
    // TBD: Maybe further check would be to get time difference between last three created messageJobs and if the difference is smaller X ms then we have maybe an abuse:
    // TBD 2: Maybe add this dinner then to a blacklist...
  }

  protected MessageTask processMessageTask(MessageTask messageTask) {

    try {
      messageTask.setSendingStartTime(LocalDateTime.now());
      messageTaskSenderService.sendMessageTaskInNewTransaction(messageTask);
      return messageTaskSenderService.markMessageTaskSuccessfulInNewTransaction(messageTask);
    } catch (Exception ex) {
      return messageTaskSenderService.markMessageTaskFailedInNewTransaction(messageTask, ex);
    }
  }
  
  private void handleMessageAbuseDetection(MessageJob messageJob, Page<MessageTask> messageTaskPage) {
   
    messageTaskSenderService.markAllMessageTasksAsMessageAbuseSuspicionInNewTransaction(messageJob);
    throw new MessageAbuseSuspicionException(messageJob);
  }
}
