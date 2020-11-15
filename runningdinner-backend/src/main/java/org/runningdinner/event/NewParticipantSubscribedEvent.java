package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.springframework.context.ApplicationEvent;

public class NewParticipantSubscribedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 2362167628097318302L;

	private RunningDinner runningDinner;

	private Participant participant;

	public NewParticipantSubscribedEvent(Object source, Participant participant, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
		this.participant = participant;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public Participant getParticipant() {
		return participant;
	}

	@Override
	public String toString() {
		return "runningDinner=" + runningDinner + ", participant=" + participant;
	}

}
