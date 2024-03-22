package org.runningdinner.participant.registrationinfo;

import org.runningdinner.participant.HasTeamPartnerWishOriginator;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;


public class ParticipantRegistrationInfo implements HasTeamPartnerWishOriginator {
  
  private UUID id;
  
  private int participantNumber;
  
  private String email;
  
  private String mobileNumber;
  
  private String firstnamePart;
  
  private String lastname;

  private LocalDateTime createdAt;
  
  private LocalDateTime activationDate;
  
  private String activatedBy;

  private UUID teamPartnerWishOriginatorId;

  private String teamPartnerWishChildInfo;
  
  public ParticipantRegistrationInfo(ParticipantRegistrationProjection src) {
    this.id = src.getId();
    this.email = src.getEmail();
    this.mobileNumber = src.getMobileNumber();
    this.firstnamePart = src.getFirstnamePart();
    this.lastname = src.getLastname();
    this.createdAt = src.getCreatedAt();
    this.activationDate = src.getActivationDate();
    this.activatedBy = src.getActivatedBy();
    this.participantNumber = src.getParticipantNumber();
    this.teamPartnerWishOriginatorId = src.getTeamPartnerWishOriginatorId();
  }

  @Override
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public int getParticipantNumber() {
    return participantNumber;
  }

  public void setParticipantNumber(int participantNumber) {
    this.participantNumber = participantNumber;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getMobileNumber() {
    return mobileNumber;
  }

  public void setMobileNumber(String mobileNumber) {
    this.mobileNumber = mobileNumber;
  }

  public String getFirstnamePart() {
    return firstnamePart;
  }
  /**
   * Use in Query as Projection to retrieve only needed attributes from Participant
   */
  public void setFirstnamePart(String firstnamePart) {
    this.firstnamePart = firstnamePart;
  }

  public String getLastname() {
    return lastname;
  }

  public void setLastname(String lastname) {
    this.lastname = lastname;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getActivationDate() {
    return activationDate;
  }

  public void setActivationDate(LocalDateTime activationDate) {
    this.activationDate = activationDate;
  }
  
  public String getActivatedBy() {
    return activatedBy;
  }

  public void setActivatedBy(String activatedBy) {
    this.activatedBy = activatedBy;
  }

  @Override
  public UUID getTeamPartnerWishOriginatorId() {
    return teamPartnerWishOriginatorId;
  }

  public void setTeamPartnerWishOriginatorId(UUID teamPartnerWishOriginatorId) {
    this.teamPartnerWishOriginatorId = teamPartnerWishOriginatorId;
  }

  public String getTeamPartnerWishChildInfo() {
    return teamPartnerWishChildInfo;
  }

  public void setTeamPartnerWishChildInfo(String teamPartnerWishChildInfo) {
    this.teamPartnerWishChildInfo = teamPartnerWishChildInfo;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if (getClass() != obj.getClass()) {
      return false;
    }
    ParticipantRegistrationInfo other = (ParticipantRegistrationInfo) obj;
    return Objects.equals(id, other.id);
  }

  @Override
  public String toString() {
    return "[id=" + id + ", participantNumber=" + participantNumber + ", firstnamePart="
        + firstnamePart + ", lastname=" + lastname + "]";
  }


}
