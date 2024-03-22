
package org.runningdinner.admin.message.job;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

import com.google.common.base.MoreObjects;

@Entity
public class MessageJob extends RunningDinnerRelatedEntity {

  private static final long serialVersionUID = 1L;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MessageType messageType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SendingStatus sendingStatus = SendingStatus.QUEUED;

  @Enumerated(EnumType.STRING)
  private FuzzyBoolean sendingFailed = FuzzyBoolean.UNKNOWN;

  private Long jobExecutionId;

  @Column(nullable = false)
  private int numberOfMessageTasks;

  protected MessageJob() {

  }

  public MessageJob(MessageType messageType, RunningDinner runningDinner) {
    super(runningDinner);
    this.messageType = messageType;
  }

  public MessageType getMessageType() {

    return messageType;
  }

  public void setMessageType(MessageType messageType) {

    this.messageType = messageType;
  }

  public void setJobExecutionId(Long id) {

    this.jobExecutionId = id;
  }

  public Long getJobExecutionId() {

    return jobExecutionId;
  }

  public SendingStatus getSendingStatus() {

    return sendingStatus;
  }

  public void setSendingStatus(SendingStatus sendingStatus) {

    this.sendingStatus = sendingStatus;
  }

  public FuzzyBoolean getSendingFailed() {

    return sendingFailed;
  }

  public void setSendingFailed(FuzzyBoolean sendingFailed) {

    this.sendingFailed = sendingFailed;
  }

  public int getNumberOfMessageTasks() {
  
    return numberOfMessageTasks;
  }

  public void setNumberOfMessageTasks(int numberOfMessageTasks) {

    this.numberOfMessageTasks = numberOfMessageTasks;
  }

  @Override
  public String toString() {
    
    return MoreObjects
            .toStringHelper(this)
            .addValue(messageType)
            .addValue(numberOfMessageTasks)
            .addValue(adminId)
            .addValue(getId())
            .toString();
  }
}
