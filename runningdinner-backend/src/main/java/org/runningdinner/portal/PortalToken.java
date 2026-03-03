package org.runningdinner.portal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.runningdinner.core.AbstractEntity;

import java.time.LocalDateTime;

@Entity
public class PortalToken extends AbstractEntity {

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, unique = true)
  private String token;

  @Column(name = "last_recovery_email_sent_at")
  private LocalDateTime lastRecoveryEmailSentAt;

  protected PortalToken() {
    // JPA
  }

  public PortalToken(String email, String token) {
    this.email = email;
    this.token = token;
  }

  public String getEmail() {
    return email;
  }

  public String getToken() {
    return token;
  }

  public LocalDateTime getLastRecoveryEmailSentAt() {
    return lastRecoveryEmailSentAt;
  }

  public void setLastRecoveryEmailSentAt(LocalDateTime lastRecoveryEmailSentAt) {
    this.lastRecoveryEmailSentAt = lastRecoveryEmailSentAt;
  }
}
