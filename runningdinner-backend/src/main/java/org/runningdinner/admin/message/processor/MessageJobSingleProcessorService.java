package org.runningdinner.admin.message.processor;

import java.time.LocalDateTime;
import java.util.List;

import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageJobRepository;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.SendingResult;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.common.exception.MessageAbuseSuspicionException;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageJobSingleProcessorService {
  
  private static Logger LOGGER = LoggerFactory.getLogger(MessageJobSingleProcessorService.class);
  
  @Autowired
  private MailService mailService;
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private MessageJobRepository messageJobRepository;
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void sendMessageTaskInNewTransaction(MessageTask messageTask) {

    mailService.sendMessage(messageTask);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageTask markMessageTaskSuccessfulInNewTransaction(MessageTask incomingMessageTask) {

    LOGGER.info("Marking {} as being successfully sent", incomingMessageTask);
    MessageTask messageTask = setBaseMessageTaskValues(incomingMessageTask);
    messageTask.getSendingResult().setDelieveryFailed(false);
    return messageTaskRepository.save(messageTask);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageTask markMessageTaskFailedInNewTransaction(MessageTask incomingMessageTask, Exception ex) {

    LOGGER.info("Marking {} as failed delievery", incomingMessageTask);
    MessageTask messageTask = setBaseMessageTaskValues(incomingMessageTask);
    messageTask.getSendingResult().setDelieveryFailed(true);
    FailureType failureType = FailureType.INVALID_EMAIL;
    messageTask.getSendingResult().setFailureType(failureType);
    messageTask.getSendingResult().setFailureMessage(getFailureMessage(ex));
    return messageTaskRepository.save(messageTask);
  }


  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob markAllMessageTasksAsMessageAbuseSuspicionInNewTransaction(MessageJob incomingMessageJob) {

    LOGGER.info("Marking {} as being failed due to message abuse suspicion", incomingMessageJob);
    MessageJob messageJob = messageJobRepository.findByIdMandatory(incomingMessageJob.getId());
    
    messageTaskRepository.updateDeliveryFailedByMessageJobId(messageJob.getId(), messageJob.getAdminId(), FailureType.ABUSE_SUSPICION, MessageAbuseSuspicionException.ERROR_MESSAGE);

    messageJob.setSendingStatus(SendingStatus.SENDING_FINISHED);
    messageJob.setSendingFailed(FuzzyBoolean.TRUE);
    return messageJobRepository.save(messageJob);
  }

  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob markMessageJobSendingStartedInNewTransaction(MessageJob incomingMessageJob) {
    
    LOGGER.info("Marking {} as being started", incomingMessageJob);
    MessageJob messageJob = messageJobRepository.findByIdMandatory(incomingMessageJob.getId());
    messageJob.setSendingStatus(SendingStatus.SENDING_STARTED);
    return messageJobRepository.save(messageJob);
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob markMessageJobSendingFinishedInNewTransaction(MessageJob incomingMessageJob, List<MessageTask> processedMessageTasks) {
    
    LOGGER.info("Marking {} as being finished", incomingMessageJob);
    MessageJob messageJob = messageJobRepository.findByIdMandatory(incomingMessageJob.getId());
    
    boolean isOneMessageTaskFailed = processedMessageTasks
                                      .stream()
                                      .anyMatch(mt -> mt.getSendingResult().isDelieveryFailed());

    if (isOneMessageTaskFailed) {
      messageJob.setSendingFailed(FuzzyBoolean.TRUE);
    } else {
      messageJob.setSendingFailed(FuzzyBoolean.FALSE);
    }

    messageJob.setSendingStatus(SendingStatus.SENDING_FINISHED);
    return messageJobRepository.save(messageJob);
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob markMessageJobSendingFinishedInNewTransaction(MessageJob incomingMessageJob, Exception ex) {

    LOGGER.info("{} was not successfully processed due to an exception", incomingMessageJob, ex);
    MessageJob messageJob = messageJobRepository.findByIdMandatory(incomingMessageJob.getId());
    messageJob.setSendingFailed(FuzzyBoolean.TRUE);
    messageJob.setSendingStatus(SendingStatus.SENDING_FINISHED);
    return messageJobRepository.save(messageJob);
  }
  
  private String getFailureMessage(Exception ex) {
   
    if (ex != null) {
      return ex.getMessage();
    }
    return "Unknown failure reason";
  }
  
  private MessageTask setBaseMessageTaskValues(MessageTask incomingMessageTask) {
    
    MessageTask messageTask = messageTaskRepository.findByIdMandatory(incomingMessageTask.getId());
    messageTask.setSendingResult(new SendingResult());
    messageTask.setSendingStartTime(incomingMessageTask.getSendingStartTime());
    messageTask.setSendingEndTime(LocalDateTime.now());
    messageTask.setSendingStatus(SendingStatus.SENDING_FINISHED);
    return messageTask;
  }

}
