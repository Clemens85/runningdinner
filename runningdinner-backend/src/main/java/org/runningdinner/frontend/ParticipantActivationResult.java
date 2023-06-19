package org.runningdinner.frontend;

import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamPartnerWishRegistrationDataTO;

public class ParticipantActivationResult {

  private ParticipantTO activatedParticipant;
  
  private TeamPartnerWishRegistrationDataTO activatedTeamPartnerRegistration;
  
  protected ParticipantActivationResult() {
    // Needed for JSON
  }
  
  public ParticipantActivationResult(ParticipantTO activatedParticipant) {
    this.activatedParticipant = activatedParticipant;
  }

  public ParticipantActivationResult(ParticipantTO activatedParticipant, TeamPartnerWishRegistrationDataTO activatedTeamPartnerRegistration) {
    this.activatedParticipant = activatedParticipant;
    this.activatedTeamPartnerRegistration = activatedTeamPartnerRegistration;
  }

  public ParticipantTO getActivatedParticipant() {
    return activatedParticipant;
  }

  public void setActivatedParticipant(ParticipantTO activatedParticipant) {
    this.activatedParticipant = activatedParticipant;
  }

  public TeamPartnerWishRegistrationDataTO getActivatedTeamPartnerRegistration() {
    return activatedTeamPartnerRegistration;
  }

  public void setActivatedTeamPartnerRegistration(TeamPartnerWishRegistrationDataTO activatedTeamPartnerRegistration) {
    this.activatedTeamPartnerRegistration = activatedTeamPartnerRegistration;
  }
  
}
