package org.runningdinner.portal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.runningdinner.core.AbstractEntity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks which portal messages a participant has already read (opened in the drawer).
 * A row's existence means the message was read; there is no separate "unread" state row.
 * A unique constraint on (participant_id, message_task_id) prevents duplicate entries.
 */
@Entity
public class PortalMessageReadReceipt extends AbstractEntity {

  @Column(nullable = false)
  private UUID participantId;

  @Column(nullable = false)
  private UUID messageTaskId;

  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime readAt;

  protected PortalMessageReadReceipt() {
  }

  public PortalMessageReadReceipt(UUID participantId, UUID messageTaskId) {
    this.participantId = participantId;
    this.messageTaskId = messageTaskId;
    this.readAt = LocalDateTime.now();
  }

  public UUID getParticipantId() {
    return participantId;
  }

  public UUID getMessageTaskId() {
    return messageTaskId;
  }

  public LocalDateTime getReadAt() {
    return readAt;
  }
}
