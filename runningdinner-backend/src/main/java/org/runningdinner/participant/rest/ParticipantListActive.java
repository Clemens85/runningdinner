package org.runningdinner.participant.rest;

import java.util.List;

public class ParticipantListActive {

	private List<ParticipantWithListNumberTO> participants;
	
	private List<ParticipantWithListNumberTO> participantsWaitingList;
	
	private boolean teamsGenerated;
	
	private int numParticipantsTotal;
	
	private MissingParticipantsInfo missingParticipantsInfo;

	public List<ParticipantWithListNumberTO> getParticipants() {
		return participants;
	}

	public void setParticipants(List<ParticipantWithListNumberTO> participants) {
		this.participants = participants;
	}

	public List<ParticipantWithListNumberTO> getParticipantsWaitingList() {
		return participantsWaitingList;
	}

	public void setParticipantsWaitingList(List<ParticipantWithListNumberTO> participantsWaitingList) {
		this.participantsWaitingList = participantsWaitingList;
	}

	public boolean isTeamsGenerated() {
		return teamsGenerated;
	}

	public void setTeamsGenerated(boolean teamsGenerated) {
		this.teamsGenerated = teamsGenerated;
	}

	public int getNumParticipantsTotal() {
		return numParticipantsTotal;
	}

	public void setNumParticipantsTotal(int numParticipantsTotal) {
		this.numParticipantsTotal = numParticipantsTotal;
	}

	public MissingParticipantsInfo getMissingParticipantsInfo() {
		return missingParticipantsInfo;
	}

	public void setMissingParticipantsInfo(MissingParticipantsInfo missingParticipantsInfo) {
		this.missingParticipantsInfo = missingParticipantsInfo;
	}
}