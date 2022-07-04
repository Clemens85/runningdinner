package org.runningdinner.participant.rest;

public class MissingParticipantsInfo {

	private int numMinParticipantsNeeded;
	
	private int numParticipantsMissing;
	
	private MissingParticipantsInfo(int numMinParticipantsNeeded, int numParticipantsMissing) {
		this.numMinParticipantsNeeded = numMinParticipantsNeeded;
		this.numParticipantsMissing = numParticipantsMissing;
	}
	
	public static MissingParticipantsInfo newMissingParticipantsInfo(int numMinParticipantsNeeded, int numParticipantsMissing) {
		return new MissingParticipantsInfo(numMinParticipantsNeeded, numParticipantsMissing);
	}
	
	public static MissingParticipantsInfo newWithExistingTeams(int numMinParticipantsNeeded) {
		return new MissingParticipantsInfo(numMinParticipantsNeeded, 0);
	}

	public int getNumMinParticipantsNeeded() {
		return numMinParticipantsNeeded;
	}

	public int getNumParticipantsMissing() {
		return numParticipantsMissing;
	}

}
