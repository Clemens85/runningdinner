package org.runningdinner.admin.message.job.stats;

import com.google.common.base.MoreObjects;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import org.runningdinner.core.AbstractEntity;

import java.time.LocalDateTime;

@Entity
public class MessageSenderHistory extends AbstractEntity {

  @Column(nullable = false)
  private String sender;

  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime sendingDate;

  @Column(nullable = false)
  private int amount;

  protected MessageSenderHistory() {

  }

  public MessageSenderHistory(String sender, LocalDateTime sendingDate, int amount) {
    this.sender = sender;
    this.sendingDate = sendingDate;
    this.amount = amount;
  }

  public String getSender() {
    return sender;
  }

  public void setSender(String sender) {
    this.sender = sender;
  }

  public LocalDateTime getSendingDate() {
    return sendingDate;
  }

  public void setSendingDate(LocalDateTime sendingDate) {
    this.sendingDate = sendingDate;
  }

  public int getAmount() {
    return amount;
  }

  public void setAmount(int amount) {
    this.amount = amount;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("sender", sender)
            .add("sendingDate", sendingDate)
            .add("amount", amount)
            .toString();
  }
}
