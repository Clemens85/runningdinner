package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.TeamCancellationResult;
import org.springframework.context.ApplicationEvent;

public class TeamCancelledEvent extends ApplicationEvent {

	private static final long serialVersionUID = 4115345831036690681L;

	private RunningDinner runningDinner;

	private TeamCancellationResult teamCancellationResult;

	public TeamCancelledEvent(Object source, TeamCancellationResult teamCancellationResult, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
		this.teamCancellationResult = teamCancellationResult;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public TeamCancellationResult getTeamCancellationResult() {
		return teamCancellationResult;
	}

	@Override
	public String toString() {
		return "runningDinner=" + runningDinner + ", teamCancellationResult=" + teamCancellationResult;
	}

}