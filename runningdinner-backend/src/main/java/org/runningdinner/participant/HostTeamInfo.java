package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.List;

public class HostTeamInfo {

	private Team team;

	private List<Team> meetedTeams = new ArrayList<>();

	protected HostTeamInfo() {
	  
	}

	public HostTeamInfo(Team team) {
		super();
		this.team = team;
	}

	public Team getTeam() {
		return team;
	}

	public void setTeam(Team team) {
		this.team = team;
	}

	public List<Team> getMeetedTeams() {
		return meetedTeams;
	}

	public void setMeetedTeams(List<Team> meetedTeams) {
		this.meetedTeams = meetedTeams;
	}

	public void addMeetedTeam(final Team team) {
		this.meetedTeams.add(team);
	}
}
