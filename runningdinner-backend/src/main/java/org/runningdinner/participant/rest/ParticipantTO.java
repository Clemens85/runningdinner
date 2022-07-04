
package org.runningdinner.participant.rest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.runningdinner.core.MealSpecifics;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;

public class ParticipantTO extends BaseParticipantTO {

  private static final long serialVersionUID = 1L;

  private int participantNumber;

  private int numSeats;

  private UUID teamId;

//  private AssignmentType assignmentType;
  
  private LocalDateTime activationDate;
  
  private GeocodingResult geocodingResult;
  
  public ParticipantTO() {

  }

  public ParticipantTO(final Participant participant) {
    super(participant);
    this.numSeats = participant.getNumSeats();
    this.participantNumber = participant.getParticipantNumber();
    
    this.teamId = participant.getTeamId();
//    this.assignmentType = participant.getAssignmentType();
    
    this.activationDate = participant.getActivationDate();
    
    this.geocodingResult = participant.getGeocodingResult();
  }

  public int getParticipantNumber() {

    return participantNumber;
  }

  public void setParticipantNumber(int participantNumber) {

    this.participantNumber = participantNumber;
  }

  public int getNumSeats() {

    return numSeats;
  }

  public void setNumSeats(int numSeats) {

    this.numSeats = numSeats;
  }

//  public AssignmentType getAssignmentType() {
//
//    return assignmentType;
//  }
//
//  public void setAssignmentType(AssignmentType assignmentType) {
//
//    this.assignmentType = assignmentType;
//  }

  public UUID getTeamId() {
  
    return teamId;
  }
  
  public LocalDateTime getActivationDate() {
  
    return activationDate;
  }

  public void setActivationDate(LocalDateTime activationDate) {
  
    this.activationDate = activationDate;
  }
  
  public GeocodingResult getGeocodingResult() {

    return geocodingResult;
  }

  public void setGeocodingResult(GeocodingResult geocodingResult) {

    this.geocodingResult = geocodingResult;
  }

  public static List<ParticipantTO> convertParticipantList(final Collection<Participant> participants) {

    List<ParticipantTO> result = new ArrayList<>(participants.size());
    for (Participant p : participants) {
      result.add(new ParticipantTO(p));
    }
    return result;
  }

  public Participant toParticipant() {

    Participant result = new Participant(this.participantNumber);

    result.setAge(getAge());
    result.setEmail(getEmail());
    result.setMobileNumber(getMobileNumber());
    result.setNumSeats(getNumSeats());

    ParticipantAddress address = new ParticipantAddress(getStreet(), getStreetNr(), getZip());
    address.setCityName(getCityName());
    address.setRemarks(getAddressRemarks());
    result.setAddress(address);

    result.setGender(getGender());

    result.setName(ParticipantName.newName().withFirstname(getFirstnamePart()).andLastname(getLastname()));

    result.setMealSpecifics(new MealSpecifics(isLactose(), isGluten(), isVegetarian(), isVegan(), getMealSpecificsNote()));
    
    result.setNotes(getNotes());
    
    result.setActivationDate(getActivationDate());
    
    result.setTeamPartnerWish(getTeamPartnerWish());

    result.setGeocodingResult(getGeocodingResult());

    return result;
  }

  @Override
  public String toString() {

    return "participantNumber=" + participantNumber + ", firstnamePart=" + getFirstnamePart() + ", lastname=" + getLastname();
  }

}
