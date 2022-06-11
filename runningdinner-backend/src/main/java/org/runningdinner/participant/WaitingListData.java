package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamTO;

import com.google.common.base.MoreObjects;

public class WaitingListData {

	private List<ParticipantTO> participtantsForTeamArrangement = new ArrayList<>();

	private List<ParticipantTO> remainingParticipants = new ArrayList<>();

	private int numMissingParticipantsForFullTeamArrangement = 0;

	private List<TeamTO> teamsWithCancelStatusOrCancelledMembers = new ArrayList<>();
	
	private int totalNumberOfMissingTeamMembers = 0;

	private List<WaitingListAction> possibleActions = new ArrayList<>();
	
	private boolean teamsGenerated;

	public List<ParticipantTO> getParticiptantsForTeamArrangement() {
		return participtantsForTeamArrangement;
	}

	public void setParticiptantsForTeamArrangement(List<ParticipantTO> participtantsForTeamArrangement) {
		this.participtantsForTeamArrangement = participtantsForTeamArrangement;
	}

	public List<ParticipantTO> getRemainingParticipants() {
		return remainingParticipants;
	}

	public void setRemainingParticipants(List<ParticipantTO> remainingParticipants) {
		this.remainingParticipants = remainingParticipants;
	}

	public int getNumMissingParticipantsForFullTeamArrangement() {
		return numMissingParticipantsForFullTeamArrangement;
	}

	public void setNumMissingParticipantsForFullTeamArrangement(int numMissingParticipantsForFullTeamArrangement) {
		this.numMissingParticipantsForFullTeamArrangement = numMissingParticipantsForFullTeamArrangement;
	}

	public List<TeamTO> getTeamsWithCancelStatusOrCancelledMembers() {
		return teamsWithCancelStatusOrCancelledMembers;
	}

	public void setTeamsWithCancelStatusOrCancelledMembers(List<TeamTO> teamsWithCancelStatusOrCancelledMembers) {
		this.teamsWithCancelStatusOrCancelledMembers = teamsWithCancelStatusOrCancelledMembers;
	}

	public List<WaitingListAction> getPossibleActions() {
		return possibleActions;
	}

	public void setPossibleActions(List<WaitingListAction> possibleActions) {
		this.possibleActions = possibleActions;
	}

	public boolean isTeamsGenerated() {
		return teamsGenerated;
	}

	public void setTeamsGenerated(boolean teamsGenerated) {
		this.teamsGenerated = teamsGenerated;
	}
	
	public int getTotalNumberOfMissingTeamMembers() {
		return totalNumberOfMissingTeamMembers;
	}

	public void setTotalNumberOfMissingTeamMembers(int totalNumberOfMissingTeamMembers) {
		this.totalNumberOfMissingTeamMembers = totalNumberOfMissingTeamMembers;
	}

	@Override
	public String toString() {
		return MoreObjects.toStringHelper(this)
							.add("participtantsForTeamArrangement", participtantsForTeamArrangement)
							.add("remainingParticipants", remainingParticipants)
							.add("numMissingParticipantsForFullTeamArrangement", numMissingParticipantsForFullTeamArrangement)
							.add("teamsWithCancelStatusOrCancelledMembers", teamsWithCancelStatusOrCancelledMembers)
							.add("possibleActions", possibleActions)
							.add("teamsGenerated", teamsGenerated)
							.toString();
	}
}
