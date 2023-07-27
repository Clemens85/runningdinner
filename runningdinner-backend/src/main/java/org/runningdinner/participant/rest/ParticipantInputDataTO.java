package org.runningdinner.participant.rest;

import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.participant.Participant;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Provides the model of all needed data for creating or updating an @see
 * {@link Participant}
 * 
 * @author stichc
 *
 */
public class ParticipantInputDataTO extends BaseParticipantTO {

  @Valid
  private TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData;
  
  public ParticipantInputDataTO() {
  }

  public ParticipantInputDataTO(Participant participant) {
    super(participant);
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
  
}
