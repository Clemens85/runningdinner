package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.rest.TeamTO;
import org.springframework.context.ApplicationEvent;

public class WaitingListTeamsGeneratedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 1L;

	private RunningDinner runningDinner;

	private List<TeamTO> teams;
	
	public WaitingListTeamsGeneratedEvent(Object source, List<TeamTO> teams, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
		this.teams = teams;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public List<TeamTO> getTeams() {
		return teams;
	}
	
}
