package org.runningdinner.frontend;

import org.runningdinner.frontend.rest.RegistrationPaymentSummaryTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.partnerwish.TeamPartnerWishInvitationState;
import org.runningdinner.participant.rest.TeamPartnerWishRegistrationDataTO;

public class RegistrationSummary {

  private Participant participant;

  private boolean canHost;

  private TeamPartnerWishInvitationState teamPartnerWishState;
  
  private TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData;
  
  private RegistrationPaymentSummaryTO registrationPaymentSummary;

  public RegistrationSummary() {
    // NOP
  }

  public RegistrationSummary(Participant participant, 
                             boolean canHost, 
                             TeamPartnerWishInvitationState teamPartnerWishState, 
                             TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData) {
    this.participant = participant;
    this.canHost = canHost;
    this.teamPartnerWishState = teamPartnerWishState;
    this.teamPartnerWishRegistrationData = teamPartnerWishRegistrationData;
  }

  public Participant getParticipant() {
    return participant;
  }

  public void setParticipant(Participant participant) {
    this.participant = participant;
  }

  public boolean isCanHost() {
    return canHost;
  }

  public void setCanHost(boolean canHost) {
    this.canHost = canHost;
  }

  public TeamPartnerWishInvitationState getTeamPartnerWishState() {

    return teamPartnerWishState;
  }

  public void setTeamPartnerWishState(TeamPartnerWishInvitationState teamPartnerWishState) {

    this.teamPartnerWishState = teamPartnerWishState;
  }

  public TeamPartnerWishRegistrationDataTO getTeamPartnerWishRegistrationData() {
    return teamPartnerWishRegistrationData;
  }

  public void setTeamPartnerWishRegistrationData(TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData) {
    this.teamPartnerWishRegistrationData = teamPartnerWishRegistrationData;
  }

  public RegistrationPaymentSummaryTO getRegistrationPaymentSummary() {
    return registrationPaymentSummary;
  }

  public void setRegistrationPaymentSummary(RegistrationPaymentSummaryTO registrationPaymentSummary) {
    this.registrationPaymentSummary = registrationPaymentSummary;
  }
  
}
