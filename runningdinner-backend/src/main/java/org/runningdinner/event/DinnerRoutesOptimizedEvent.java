package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Team;
import org.springframework.context.ApplicationEvent;

public class DinnerRoutesOptimizedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 1L;

	private RunningDinner runningDinner;

	private int numTeams;

	public DinnerRoutesOptimizedEvent(Object source, int numTeams, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
		this.numTeams = numTeams;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public int getNumTeams() {
		return numTeams;
	}

	@Override
	public String toString() {
		return "DinnerRoutesOptimizedEvent{" +
				"runningDinner=" + runningDinner.getAdminId() +
				", numTeams=" + numTeams +
				'}';
	}

}
