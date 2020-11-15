package org.runningdinner.mail.sendgrid;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.AbstractEntity;

@Entity
public class MailSynchronizationState extends AbstractEntity {

  private static final long serialVersionUID = 1L;

  @Column(nullable = false)
  private LocalDateTime synchronizationDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MailSynchronizationResult synchronizationResult;

  @Column(length = 512)
  private String additionalInformation;

  protected MailSynchronizationState()
  {
    // JPA
  }

  public MailSynchronizationState(LocalDateTime synchronizationDate) {

    this.synchronizationDate = synchronizationDate;
  }

  public LocalDateTime getSynchronizationDate() {
    return synchronizationDate;
  }

  public void setSynchronizationDate(LocalDateTime synchronizationDate) {
    this.synchronizationDate = synchronizationDate;
  }

  public MailSynchronizationResult getSynchronizationResult() {
    return synchronizationResult;
  }

  public void setSynchronizationResult(MailSynchronizationResult synchronizationResult) {
    this.synchronizationResult = synchronizationResult;
  }

  public String getAdditionalInformation() {
    return additionalInformation;
  }

  public void setAdditionalInformation(String additionalInformation) {
    this.additionalInformation = StringUtils.truncate(additionalInformation, 512);
  }
}
