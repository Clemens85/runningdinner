
package org.runningdinner.core;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Central entity of application.<br>
 * User can create RunnignDinner instances and administrate them later.<br>
 * RunningDinner instance contains basic info details, the configuration options
 * of the dinner and a very simple "workflow"-state about administration
 * activities.<br>
 * Furthermore it contains all participants and the team-arrangements of the
 * participants including the visitation-plans (dinner-routes) for each regular
 * team.<br>
 * A dinner instance is identified by an (on creation) generated UUID.
 * 
 * @author Clemens
 * 
 */
@Entity
public class RunningDinner extends AbstractEntity implements RunningDinnerInfo {

  private static final long serialVersionUID = -6099048543502048569L;

  @Column(length = 48, unique = true, nullable = false)
  private String adminId;

  @Column(nullable = false)
  private String title;

  private String city;

  @Column(length = 16, nullable = false)
  private String zip;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String languageCode;
  
  @Enumerated(EnumType.STRING)
  @Column(length = 32, nullable = false)
  private RegistrationType registrationType;

  @Embedded
  private PublicSettings publicSettings = new PublicSettings();
  
  @Embedded 
  @AttributeOverrides({
    @AttributeOverride(name = "street", column = @Column(name = "afterPartyLocationStreet")),
    @AttributeOverride(name = "streetNr", column = @Column(name = "afterPartyLocationStreetNr")),
    @AttributeOverride(name = "zip", column = @Column(name = "afterPartyLocationZip")),
    @AttributeOverride(name = "cityName", column = @Column(name = "afterPartyLocationCityName")),
    @AttributeOverride(name = "addressName", column = @Column(name = "afterPartyLocationAddressName")),
    @AttributeOverride(name = "addressRemarks", column = @Column(name = "afterPartyLocationRemarks")),
    @AttributeOverride(name = "title", column = @Column(name = "afterPartyTitle"))
  })
  private AfterPartyLocation afterPartyLocation = new AfterPartyLocation();

  @Embedded
  private RunningDinnerConfig configuration;
  
  @Column(nullable = false)
  private UUID selfAdministrationId;
  
  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime cancellationDate;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private RunningDinnerType runningDinnerType = RunningDinnerType.STANDARD; 

  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  private LocalDateTime acknowledgedDate;
  
  public RunningDinner() {
    super();
  }

  /**
   * UUID which is used to find a RunningDinner instance
   * 
   * @return
   */
  public String getAdminId() {

    return adminId;
  }

  public void setAdminId(String adminId) {

    this.adminId = adminId;
  }

  @Override
  public String getTitle() {

    return title;
  }

  public void setTitle(String title) {

    this.title = title;
  }

  @Override
  public String getCity() {

    return city;
  }

  public void setCity(String city) {

    this.city = city;
  }

  @Override
  public LocalDate getDate() {

    return date;
  }

  public void setDate(LocalDate date) {

    this.date = date;
  }

  /**
   * The email address of the creator of the RunningDinner
   */
  public String getEmail() {

    return email;
  }

  public void setEmail(String email) {

    this.email = email;
  }

  public RunningDinnerConfig getConfiguration() {

    return configuration;
  }

  public void setConfiguration(RunningDinnerConfig configuration) {

    this.configuration = configuration;
  }

  @Override
  public String getZip() {

    return zip;
  }

  public void setZip(String zip) {

    this.zip = zip;
  }

  @Override
  public RegistrationType getRegistrationType() {

    return registrationType;
  }

  public void setRegistrationType(RegistrationType registrationType) {

    this.registrationType = registrationType;
  }

  public PublicSettings getPublicSettings() {

    if (publicSettings == null) {
      return new PublicSettings();
    }
    return publicSettings;
  }

  public void setPublicSettings(PublicSettings publicSettings) {

    this.publicSettings = publicSettings;
  }
  
  public UUID getSelfAdministrationId() {
  
    return selfAdministrationId;
  }
  
  public void setSelfAdministrationId(UUID selfAdministrationId) {
  
    this.selfAdministrationId = selfAdministrationId;
  }

  public boolean canRegistrate(LocalDate date) {

    if (publicSettings == null) {
      return false;
    }
    LocalDate endOfRegistrationDate = publicSettings.getEndOfRegistrationDate();
    if (endOfRegistrationDate == null) {
      // Falllback which should however never happen...
      endOfRegistrationDate = getDate();
    }

    if (endOfRegistrationDate == null) {
      // Very weird... should never ever happen... really!
      return false;
    }

    return endOfRegistrationDate.isEqual(date) || endOfRegistrationDate.isAfter(date);
  }

  public LocalDateTime getCancellationDate() {
  
    return cancellationDate;
  }

  public void setCancellationDate(LocalDateTime cancellationDate) {
  
    this.cancellationDate = cancellationDate;
  }
  
  public boolean isCancelled() {
    
    return cancellationDate != null;
  }
  
  public RunningDinnerType getRunningDinnerType() {
  
    return runningDinnerType;
  }
  
  public void setRunningDinnerType(RunningDinnerType runningDinnerType) {
  
    this.runningDinnerType = runningDinnerType;
  }

  public LocalDateTime getAcknowledgedDate() {
  
    return acknowledgedDate;
  }

  public void setAcknowledgedDate(LocalDateTime acknowledgedDate) {
  
    this.acknowledgedDate = acknowledgedDate;
  }
  
  public boolean isAcknowledged() {
    
    return acknowledgedDate != null;
  }
  
  @Override
  public String getLanguageCode() {
  
    return StringUtils.trim(StringUtils.lowerCase(languageCode));
  }
  
  public void setLanguageCode(String languageCode) {
  
    this.languageCode = StringUtils.trim(StringUtils.lowerCase(languageCode));
  }
  
  public Optional<AfterPartyLocation> getAfterPartyLocation() {
    return afterPartyLocation != null && afterPartyLocation.isDefined() ? Optional.of(afterPartyLocation) : Optional.empty();
  }

  public void setAfterPartyLocation(AfterPartyLocation afterPartyLocation) {
    this.afterPartyLocation = afterPartyLocation;
  }

  public RunningDinnerInfo createDetachedCloneRunningDinnerInfo() {

    RunningDinner result = new RunningDinner(); // Abuse that this object is an implementation of RunningDinnerInfo
    result.setCity(getCity());
    result.setDate(getDate());
    result.setRegistrationType(getRegistrationType());
    result.setTitle(getTitle());
    result.setZip(getZip());
    result.setLanguageCode(getLanguageCode());
    return result;
  }
  
  @Override
  public int hashCode() {

    return new HashCodeBuilder(11, 31).append(getAdminId()).toHashCode();
  }

  @Override
  public boolean equals(Object obj) {

    if (obj == null) {
      return false;
    }
    if (obj == this) {
      return true;
    }
    if (obj.getClass() != getClass()) {
      return false;
    }

    RunningDinner other = (RunningDinner) obj;
    return new EqualsBuilder().append(getAdminId(), other.getAdminId()).isEquals();
  }

  @Override
  public String toString() {

    return getTitle() + " - " + getAdminId();
  }

  
  public enum RunningDinnerType {
    
    DEMO,
    
    STANDARD
  }

}
