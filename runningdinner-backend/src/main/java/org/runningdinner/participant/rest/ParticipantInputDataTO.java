package org.runningdinner.participant.rest;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.Valid;

/**
 * Provides the model of all needed data for creating or updating an @see
 * {@link Participant}
 * 
 * @author stichc
 *
 */
@SuppressWarnings("serial")
public class ParticipantInputDataTO extends BaseParticipantTO {

  @Valid
  private TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData;
  
  /**
   * Only used for import scenarios
   */
  private GeocodingResult geocodingResult;
  
  public ParticipantInputDataTO() {
  }

  public ParticipantInputDataTO(Participant participant) {
    super(participant);
    this.geocodingResult = participant.getGeocodingResult();
  }

  @Override
  public TeamPartnerWishRegistrationDataTO getTeamPartnerWishRegistrationData() {
    return teamPartnerWishRegistrationData;
  }

  @Override
  public void setTeamPartnerWishRegistrationData(TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData) {
    this.teamPartnerWishRegistrationData = teamPartnerWishRegistrationData;
  }

  @JsonIgnore
  public boolean isTeamPartnerWishInvitationEmailAddressProvided() {
    return StringUtils.isNotBlank(getTeamPartnerWishEmail());
  }
  
  @JsonIgnore
  public boolean isTeamPartnerWishRegistrationDataProvided() {
    return teamPartnerWishRegistrationData != null;
  }
  
  public GeocodingResult getGeocodingResult() {

    return geocodingResult;
  }

  public void setGeocodingResult(GeocodingResult geocodingResult) {

    this.geocodingResult = geocodingResult;
  }
  
}
