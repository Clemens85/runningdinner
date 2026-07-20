package org.runningdinner.portal;

import org.runningdinner.admin.message.job.MessageType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a single message (email) sent by the organizer to the participant,
 * as returned by the participant portal messages endpoint.
 */
public class PortalMessageTO {

  private MessageType messageType;
  private String subject;
  private String content;
  private LocalDateTime sentDateTime;
  private String replyTo;
  private UUID messageTaskId;
  private boolean read;

  protected PortalMessageTO() {
  }

  public PortalMessageTO(MessageType messageType, String subject, String content, LocalDateTime sentDateTime, String replyTo, UUID messageTaskId, boolean read) {
    this.messageType = messageType;
    this.subject = subject;
    this.content = content;
    this.sentDateTime = sentDateTime;
    this.replyTo = replyTo;
    this.messageTaskId = messageTaskId;
    this.read = read;
  }

  public MessageType getMessageType() {
    return messageType;
  }

  public void setMessageType(MessageType messageType) {
    this.messageType = messageType;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public LocalDateTime getSentDateTime() {
    return sentDateTime;
  }

  public void setSentDateTime(LocalDateTime sentDateTime) {
    this.sentDateTime = sentDateTime;
  }

  public String getReplyTo() {
    return replyTo;
  }

  public void setReplyTo(String replyTo) {
    this.replyTo = replyTo;
  }

  public UUID getMessageTaskId() {
    return messageTaskId;
  }

  public void setMessageTaskId(UUID messageTaskId) {
    this.messageTaskId = messageTaskId;
  }

  public boolean isRead() {
    return read;
  }

  public void setRead(boolean read) {
    this.read = read;
  }
}
