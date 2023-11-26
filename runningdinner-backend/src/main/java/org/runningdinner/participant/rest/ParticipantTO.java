
package org.runningdinner.participant.rest;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.HasTeamPartnerWishOriginator;
import org.runningdinner.participant.Participant;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class ParticipantTO extends BaseParticipantTO implements HasTeamPartnerWishOriginator {

  private static final long serialVersionUID = 1L;

  private int participantNumber;

  private UUID teamId;

  private LocalDateTime activationDate;
  
  private GeocodingResult geocodingResult;
  
  private UUID teamPartnerWishOriginatorId;
  
  public ParticipantTO() {

  }

  public ParticipantTO(final Participant participant) {
    super(participant);
    this.participantNumber = participant.getParticipantNumber();
    this.teamId = participant.getTeamId();
    this.activationDate = participant.getActivationDate();
    this.geocodingResult = participant.getGeocodingResult();
    this.teamPartnerWishOriginatorId = participant.getTeamPartnerWishOriginatorId();
  }

  public int getParticipantNumber() {

    return participantNumber;
  }

  public void setParticipantNumber(int participantNumber) {

    this.participantNumber = participantNumber;
  }

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

  @Override
  public UUID getTeamPartnerWishOriginatorId() {
    return teamPartnerWishOriginatorId;
  }

  public static List<ParticipantTO> convertParticipantList(final Collection<Participant> participants) {

    List<ParticipantTO> result = new ArrayList<>(participants.size());
    for (Participant p : participants) {
      result.add(new ParticipantTO(p));
    }
    return result;
  }

  @Override
  public String toString() {

    return "participantNumber=" + participantNumber + ", firstnamePart=" + getFirstnamePart() + ", lastname=" + getLastname();
  }

}
