package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.List;

public class TeamMeetingPlan {

	private Team team;

	private List<HostTeamInfo> hostTeams = new ArrayList<>();

	private List<Team> guestTeams = new ArrayList<>();

	public TeamMeetingPlan() {
	}

	public TeamMeetingPlan(Team team) {
		super();
		this.team = team;
	}

	public Team getTeam() {
		return team;
	}

	public void setTeam(Team team) {
		this.team = team;
	}

	public List<HostTeamInfo> getHostTeams() {
		return hostTeams;
	}

	public void setHostTeams(List<HostTeamInfo> hostTeams) {
		this.hostTeams = hostTeams;
	}

	public List<Team> getGuestTeams() {
		return guestTeams;
	}

	public void setGuestTeams(List<Team> guestTeams) {
		this.guestTeams = guestTeams;
	}

	public void addGuestTeam(final Team guestTeam) {
		this.guestTeams.add(guestTeam);
	}

	public void addHostTeamInfo(final HostTeamInfo hostTeam) {
		this.hostTeams.add(hostTeam);
	}
}
