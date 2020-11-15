package org.runningdinner.participant.rest;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.participant.Team;

public class HostTeamTO extends TeamTO {

	private static final long serialVersionUID = 1L;

	private List<TeamTO> meetedTeams = new ArrayList<>();

	public HostTeamTO() {
		super();
	}

	public HostTeamTO(Team team) {
		super(team);
	}

	public List<TeamTO> getMeetedTeams() {
		return meetedTeams;
	}

	public void setMeetedTeams(List<TeamTO> meetedTeams) {
		this.meetedTeams = meetedTeams;
	}

}
