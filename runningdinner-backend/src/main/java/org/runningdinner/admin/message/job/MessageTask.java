
package org.runningdinner.admin.message.job;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.MoreObjects;

@Entity
public class MessageTask extends RunningDinnerRelatedEntity {

  private static final long serialVersionUID = 1L;

  @ManyToOne(optional = false)
  @JoinColumn(nullable = false, name = "parentJobId", updatable = false, insertable = false)
  @JsonIgnore
  private MessageJob parentJob;
  
  @Column(nullable = false)
  private UUID parentJobId;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private SendingStatus sendingStatus = SendingStatus.QUEUED;

  @Column(nullable = false)
  @NotBlank
  @Email
  private String recipientEmail;

  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime sendingStartTime;

  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime sendingEndTime;

  @Embedded
  @AttributeOverrides({
    @AttributeOverride(name = "delieveryFailed", column = @Column(nullable = false)),
    @AttributeOverride(name = "failureMessage", column = @Column(length = 512)),
  })
  private SendingResult sendingResult = new SendingResult();

  @Embedded
  @Valid
  @AttributeOverrides({
    @AttributeOverride(name = "content", column = @Column(nullable = false, length = BaseMessage.MAX_MESSAGE_LENGTH)),
    @AttributeOverride(name = "subject", column = @Column(nullable = false)),
    @AttributeOverride(name = "replyTo", column = @Column(nullable = false))
  })
  private Message message = new Message();

  protected MessageTask() {
    super();
  }

  public MessageTask(MessageJob parentJob, RunningDinner runningDinner) {
    super(runningDinner);
    this.setParentJob(parentJob);
    this.sendingStatus = SendingStatus.QUEUED;
  }

  /**
   * Provides the means for sending a message directly to recipient without being dependent of a running dinner instance or database.
   * 
   * @param recipientEmail
   * @param message
   * @return
   */
  public static MessageTask newVirtualMessageTask(String recipientEmail, Message message) {
    
    MessageTask result = new MessageTask();
    result.setMessage(message);
    result.setRecipientEmail(recipientEmail);
    return result;
  }
  
  public MessageJob getParentJob() {

    return parentJob;
  }

  public void setParentJob(MessageJob parentJob) {

    this.parentJob = parentJob;
    this.parentJobId = parentJob != null ? parentJob.getId() : null;
  }

  public UUID getParentJobId() {
  
    return parentJobId;
  }

  public SendingStatus getSendingStatus() {

    return sendingStatus;
  }

  public void setSendingStatus(SendingStatus sendingStatus) {

    this.sendingStatus = sendingStatus;
  }

  public String getRecipientEmail() {

    return recipientEmail;
  }

  public void setRecipientEmail(String recipientEmail) {

    this.recipientEmail = recipientEmail;
  }

  public LocalDateTime getSendingStartTime() {

    return sendingStartTime;
  }

  public void setSendingStartTime(LocalDateTime sendingStartTime) {

    this.sendingStartTime = sendingStartTime;
  }

  public LocalDateTime getSendingEndTime() {

    return sendingEndTime;
  }

  public void setSendingEndTime(LocalDateTime sendingEndTime) {

    this.sendingEndTime = sendingEndTime;
  }

  public SendingResult getSendingResult() {

    return sendingResult;
  }

  public void setSendingResult(SendingResult sendingResult) {

    this.sendingResult = sendingResult;
  }

  public Message getMessage() {

    return message;
  }

  public void setMessage(Message message) {

    this.message = message;
  }
  
  @Override
  public String toString() {
    
    return MoreObjects
            .toStringHelper(this)
            .addValue(id)
            .addValue(sendingStatus)
            .addValue(sendingResult)
            .addValue(message)
            .toString();
  }
}
