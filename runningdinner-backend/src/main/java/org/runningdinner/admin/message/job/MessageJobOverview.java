package org.runningdinner.admin.message.job;

import java.util.List;
import java.util.UUID;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.core.RunningDinnerRelated;

public class MessageJobOverview implements RunningDinnerRelated {

  private UUID messageJobId;
  
  private long numMessagesSucceeded;
  
  private long numMessagesFailed;
  
  private boolean sendingFinished;
  
  private UUID runningDinnerId;
  
  private String adminId;
  
  protected MessageJobOverview() {
    
    // JSON
  }
  
  public MessageJobOverview(UUID messageJobId, long numMessagesSucceeded, long numMessagesFailed, boolean sendingFinished, UUID runningDinnerId, String adminId) {

    this.messageJobId = messageJobId;
    this.numMessagesSucceeded = numMessagesSucceeded;
    this.numMessagesFailed = numMessagesFailed;
    this.sendingFinished = sendingFinished;
    this.runningDinnerId = runningDinnerId;
    this.adminId = adminId;
  }

  public UUID getMessageJobId() {
  
    return messageJobId;
  }

  public long getNumMessagesSucceeded() {
  
    return numMessagesSucceeded;
  }
  
  public long getNumMessagesFailed() {
  
    return numMessagesFailed;
  }
  
  public boolean isSendingFinished() {
  
    return sendingFinished;
  }

  @Override
  public UUID getRunningDinnerId() {

    return runningDinnerId;
  }

  @Override
  public String getAdminId() {

    return adminId;
  }

  public static MessageJobOverview newMessageJobOverview(List<MessageTask> messageTasks) {
    
    if (CollectionUtils.isEmpty(messageTasks)) {
      throw new IllegalStateException("Can not construct MessageJobOverview without a single MessageTask");
    }
    
    final MessageJob messageJob = messageTasks.get(0).getParentJob();
    
    UUID messageJobId = messageJob.getId();
    boolean sendingFinished = messageJob.getSendingStatus() == SendingStatus.SENDING_FINISHED;
    
    long numMessagesSucceeded = messageTasks
                                  .stream()
                                  .filter(mt -> mt.getSendingStatus() == SendingStatus.SENDING_FINISHED)
                                  .filter(mt -> !mt.getSendingResult().isDelieveryFailed())
                                  .count();
    
    long numMessagesFailed = messageTasks
                              .stream()
                              .filter(mt -> mt.getSendingStatus() == SendingStatus.SENDING_FINISHED)
                              .filter(mt -> mt.getSendingResult().isDelieveryFailed())
                              .count();
    
    return new MessageJobOverview(messageJobId, numMessagesSucceeded, numMessagesFailed, sendingFinished, messageJob.getRunningDinnerId(), messageJob.getAdminId());
  }
}
