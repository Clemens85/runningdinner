
package org.runningdinner.participant;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;
import org.runningdinner.geocoder.GeocodingResult;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.MoreObjects;

/**
 * Represents a participant of a running dinner.<br>
 * Each participant is identified by his participantNumber which is unique inside <b>one</b> running-dinner.
 * The participant number is also used for comparing participants and is thus also used for giving participants with a lower number a higher
 * precedence when they are assigned into teams.
 * 
 * @author Clemens Stich
 * 
 */
@Entity
@Access(AccessType.FIELD)
public class Participant extends RunningDinnerRelatedEntity implements Comparable<Participant> {

  private static final long serialVersionUID = -8062709434676386371L;

  /**
   * Number which represents an undefined (=unknown) number of seats of a participant
   */
  public static final int UNDEFINED_SEATS = -1;

  /**
   * Number which represents an undefined (=unknown) age of a participant
   */
  public static final int UNDEFINED_AGE = -1;

  @Column(nullable = false)
  private int participantNumber;

  @Embedded
  private ParticipantName name;

  @Embedded
  private ParticipantAddress address;

  private String email;

  private String mobileNumber;

  @Enumerated(EnumType.STRING)
  @Column(length = 16)
  private Gender gender;

  private int age;

  private int numSeats;

  private boolean host;

  @Embedded
  @AttributeOverride(name = "mealSpecificsNote", column = @Column(name = "mealspecificsnote"))
  private MealSpecifics mealSpecifics = new MealSpecifics();

  @Column(length = 512)
  private String notes;

  @Column(name = "teamPartnerWish")
  private String teamPartnerWishEmail;
  
  private LocalDateTime activationDate;
  
  @JsonIgnore
  private String activatedBy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "teamId", nullable = true, insertable = false, updatable = false)
  @JsonIgnore
  private Team team;

  private UUID teamId;
  
  @Column(columnDefinition = "uuid references runningdinner.Participant")
  private UUID teamPartnerWishOriginatorId;

  @Embedded
  private GeocodingResult geocodingResult = new GeocodingResult();

  public Participant() {

    this.numSeats = UNDEFINED_SEATS;
  }

  /**
   * Constructs a new participant with his participant-number.<br>
   * 
   * @param participantNumber
   */
  public Participant(int participantNumber) {
    this();
    this.participantNumber = participantNumber;
  }

  public Participant(RunningDinner runningDinner) {

    super(runningDinner);
  }

  public Participant(RunningDinner runningDinner, int participantNumber) {

    this(runningDinner);
    this.participantNumber = participantNumber;
  }

  /**
   * Returns the name of a participant
   * 
   * @return Participant's name. Is never null.
   */
  public ParticipantName getName() {

    return name;
  }

  public void setName(ParticipantName name) {

    if (name == null) {
      throw new NullPointerException("Null value for name is not allowed!");
    }
    this.name = name;
  }

  /**
   * Returns the address of a participant
   * 
   * @return Participant's address. Is never null.
   */
  public ParticipantAddress getAddress() {

    return address;
  }

  public void setAddress(ParticipantAddress address) {

    if (address == null) {
      throw new NullPointerException("Null value for address is not allowed!");
    }
    this.address = address;
  }

  public Gender getGender() {

    if (gender == null) {
      return Gender.UNDEFINED;
    }
    return gender;
  }

  public void setGender(Gender gender) {

    this.gender = gender;
  }

  public int getAge() {

    return age;
  }

  public void setAge(int age) {

    this.age = age;
  }

  public int getNumSeats() {

    return numSeats;
  }

  public void setNumSeats(int numSeats) {

    this.numSeats = numSeats;
  }

  public String getEmail() {

    if (email == null) {
      return StringUtils.EMPTY;
    }
    return StringUtils.trim(email);
  }

  public void setEmail(String email) {

    this.email = StringUtils.trim(email);
  }

  public String getMobileNumber() {

    if (mobileNumber == null) {
      return StringUtils.EMPTY;
    }
    return mobileNumber;
  }

  public void setMobileNumber(String mobileNumber) {

    this.mobileNumber = StringUtils.trim(mobileNumber);
  }

  public int getParticipantNumber() {

    return participantNumber;
  }

  public void setParticipantNumber(int participantNumber) {

    this.participantNumber = participantNumber;
  }

  /**
   * If true a participant is marked as the host within a team.<br>
   * There exist only one host inside one team.
   * 
   * @return
   */
  public boolean isHost() {

    return host;
  }

  public void setHost(boolean host) {

    this.host = host;
  }

  public MealSpecifics getMealSpecifics() {

    if (mealSpecifics == null) {
      return MealSpecifics.NONE;
    }
    return mealSpecifics;
  }

  public boolean hasMealSpecifics() {

    return mealSpecifics != null && !MealSpecifics.NONE.equals(getMealSpecifics());
  }

  public void setMealSpecifics(MealSpecifics mealSpecifics) {

    this.mealSpecifics = mealSpecifics;
  }

  public String getNotes() {

    return notes;
  }

  public void setNotes(String notes) {

    this.notes = notes;
  }

  public String getTeamPartnerWishEmail() {

    return StringUtils.trim(teamPartnerWishEmail);
  }

  public void setTeamPartnerWishEmail(String teamPartnerWishEmail) {

    this.teamPartnerWishEmail = StringUtils.trim(teamPartnerWishEmail);
  }

  public Team getTeam() {

    return team;
  }

  protected void setTeam(Team team) {

    this.team = team;
    this.teamId = team != null ? team.getId() : null;
  }

  public UUID getTeamId() {

    return teamId;
  }
  
  protected void removeTeamReference() {
    
    this.team = null;
    this.teamId = null;
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
  
  public boolean isActivated() {
    
    return getActivationDate() != null;
  }

  public GeocodingResult getGeocodingResult() {

    return geocodingResult;
  }

  public void setGeocodingResult(GeocodingResult geocodingResult) {

    this.geocodingResult = geocodingResult;
  }

  public UUID getTeamPartnerWishOriginatorId() {
    return teamPartnerWishOriginatorId;
  }

  public void setTeamPartnerWishOriginatorId(UUID teamPartnerWishOriginatorId) {
    this.teamPartnerWishOriginatorId = teamPartnerWishOriginatorId;
  }

  public boolean isTeamPartnerWishRegistratonRoot() {
    return teamPartnerWishOriginatorId != null && getId() != null && Objects.equals(getTeamPartnerWishOriginatorId(), getId());
  }
  
  public boolean isTeamPartnerWishRegistrationChildOf(Participant other) {
    return Objects.equals(other.getTeamPartnerWishOriginatorId(), this.getId()) ||
           Objects.equals(this.getTeamPartnerWishOriginatorId(), other.getId());
  }

  // equals and hashcode implementations are actually wrong... but unfortunately we relied on a implementation based upon participantNumber...
  // which now proved to be not good enough as we can swap participant numbers... 
  // Switching back to the objectId would break some other code... so for now we have this unstable implementation which should however fit our practical needs...
  
  @Override
  public int hashCode() {
    return new HashCodeBuilder(17, 7).append(getParticipantNumber()).toHashCode();
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
    Participant other = (Participant) obj;
    return new EqualsBuilder().append(getParticipantNumber(), other.getParticipantNumber()).isEquals();
  }

  
  @Override
  public int compareTo(Participant o) {

    if (this.getParticipantNumber() < o.getParticipantNumber()) {
      return -1;
    }
    if (this.getParticipantNumber() > o.getParticipantNumber()) {
      return 1;
    }
    return 0;
  }

  @Override public String toString() {

    return MoreObjects.toStringHelper(this)
            .addValue(participantNumber)
            .addValue(getName().toString())
            .addValue(gender)
            .add("host", isHost())
            .toString();
  }

  public Participant createDetachedClone() {

    Participant result = new Participant(getParticipantNumber());
    result.setAddress(getAddress().createDetachedClone());
    result.setAge(getAge());
    result.setEmail(getEmail());
    result.setGender(getGender());
    result.setHost(host);
    result.setMealSpecifics(getMealSpecifics().createDetachedClone());
    result.setMobileNumber(getMobileNumber());
    result.setName(getName().createDetachedClone());
    result.setNotes(getNotes());
    result.setNumSeats(getNumSeats());
    result.setTeamPartnerWishEmail(getTeamPartnerWishEmail());
    result.setActivatedBy(getActivatedBy());
    result.setActivationDate(getActivationDate());
    result.setGeocodingResult(new GeocodingResult(getGeocodingResult()));
    result.setTeamPartnerWishOriginatorId(getTeamPartnerWishOriginatorId());
    return result;
  }

}
