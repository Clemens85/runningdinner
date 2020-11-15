package org.runningdinner.frontend;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.partnerwish.TeamPartnerWishState;

public class RegistrationSummary {

	private Participant participant;

	private boolean canHost;
	
	private TeamPartnerWishState teamPartnerWishState;

	public RegistrationSummary() {

	}

	public RegistrationSummary(Participant participant, boolean canHost, TeamPartnerWishState teamPartnerWishState) {
		this.participant = participant;
		this.canHost = canHost;
		this.teamPartnerWishState = teamPartnerWishState;
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

  public TeamPartnerWishState getTeamPartnerWishState() {
  
    return teamPartnerWishState;
  }

  public void setTeamPartnerWishState(TeamPartnerWishState teamPartnerWishState) {
  
    this.teamPartnerWishState = teamPartnerWishState;
  }

}
