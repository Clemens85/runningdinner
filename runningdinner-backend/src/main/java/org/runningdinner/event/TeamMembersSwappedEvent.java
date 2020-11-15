package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.context.ApplicationEvent;

public class TeamMembersSwappedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 4115345831036690681L;

	private RunningDinner runningDinner;

	private List<Team> affectedParentTeams;

	private Participant firstParticipant;

	private Participant secondParticipant;

	public TeamMembersSwappedEvent(Object source, Participant firstParticipant, Participant secondParticipant,
			List<Team> affectedParentTeams, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
		this.firstParticipant = firstParticipant;
		this.secondParticipant = secondParticipant;
		this.affectedParentTeams = affectedParentTeams;
	}


	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public List<Team> getAffectedParentTeams() {
		return affectedParentTeams;
	}

	public Participant getFirstParticipant() {
		return firstParticipant;
	}

	public Participant getSecondParticipant() {
		return secondParticipant;
	}


	@Override
	public String toString() {
		return "affectedParentTeams=" + affectedParentTeams + ", firstParticipant=" + firstParticipant + ", secondParticipant="
				+ secondParticipant;
	}


}