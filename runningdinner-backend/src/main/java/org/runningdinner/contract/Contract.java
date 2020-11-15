
package org.runningdinner.contract;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.Type;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.AbstractEntity;

@Entity
public class Contract extends AbstractEntity {

  @NotBlank
  @SafeHtml
  private String fullname;

  @NotBlank
  @Email
  @SafeHtml
  private String email;

  @NotBlank
  @SafeHtml
  private String streetWithNr;

  @NotBlank
  @Length(max = 16)
  @SafeHtml
  private String zip;

  @SafeHtml
  private String city;

  private boolean advAcknowledged = true;
  
  private String ip;
  
  private boolean newsletterEnabled = false;

  private LocalDateTime newsletterEnabledChangeDateTime;

  @Column(columnDefinition = "uuid references runningdinner.RunningDinner")
  @Type(type = "pg-uuid")
  private UUID parentRunningDinnerId;

  @Column(columnDefinition = "uuid references runningdinner.DeletedRunningDinner")
  @Type(type = "pg-uuid")
  private UUID parentDeletedRunningDinnerId;

  public String getFullname() {

    return fullname;
  }

  public void setFullname(String fullname) {

    this.fullname = fullname;
  }

  public String getEmail() {

    return email;
  }

  public void setEmail(String email) {

    this.email = email;
  }

  public String getStreetWithNr() {

    return streetWithNr;
  }

  public void setStreetWithNr(String streetWithNr) {

    this.streetWithNr = streetWithNr;
  }

  public String getZip() {

    return zip;
  }

  public void setZip(String zip) {

    this.zip = zip;
  }

  public String getCity() {

    return city;
  }

  public void setCity(String city) {

    this.city = city;
  }

  public boolean isNewsletterEnabled() {

    return newsletterEnabled;
  }

  public void setNewsletterEnabled(boolean newsletterEnabled) {

    this.newsletterEnabled = newsletterEnabled;
  }

  public LocalDateTime getNewsletterEnabledChangeDateTime() {
  
    return newsletterEnabledChangeDateTime;
  }
  
  public void setNewsletterEnabledChangeDateTime(LocalDateTime newsletterEnabledChangeDateTime) {
  
    this.newsletterEnabledChangeDateTime = newsletterEnabledChangeDateTime;
  }

  public boolean isAdvAcknowledged() {

    return advAcknowledged;
  }

  public void setAdvAcknowledged(boolean advAcknowledged) {

    this.advAcknowledged = advAcknowledged;
  }

  public UUID getParentRunningDinnerId() {

    return parentRunningDinnerId;
  }

  public void setParentRunningDinnerId(UUID parentRunningDinnerId) {

    this.parentRunningDinnerId = parentRunningDinnerId;
  }

  public UUID getParentDeletedRunningDinnerId() {

    return parentDeletedRunningDinnerId;
  }

  public void setParentDeletedRunningDinnerId(UUID parentDeletedRunningDinnerId) {

    this.parentDeletedRunningDinnerId = parentDeletedRunningDinnerId;
  }
  
  public String getIp() {

    return ip;
  }

  public void setIp(String ip) {

    this.ip = ip;
  }
  
}
