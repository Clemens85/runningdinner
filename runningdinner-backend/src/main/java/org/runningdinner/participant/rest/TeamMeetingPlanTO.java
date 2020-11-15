package org.runningdinner.participant.rest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.runningdinner.participant.HostTeamInfo;
import org.runningdinner.participant.TeamMeetingPlan;

public class TeamMeetingPlanTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private TeamTO team;
	
	private List<TeamTO> guestTeams = new ArrayList<>();
	
	private List<HostTeamTO> hostTeams = new ArrayList<>();

	protected TeamMeetingPlanTO() {
		
	}
	
	public TeamMeetingPlanTO(final TeamMeetingPlan teamMeetingPlan) {
		this.team = new TeamTO(teamMeetingPlan.getTeam());
		this.guestTeams = TeamTO.convertTeamList(teamMeetingPlan.getGuestTeams());
		
		List<HostTeamInfo> hostTeamInfoList = teamMeetingPlan.getHostTeams();
		for (HostTeamInfo hostTeamInfo : hostTeamInfoList) {
			HostTeamTO hostTeamTO = new HostTeamTO(hostTeamInfo.getTeam());
			hostTeamTO.setMeetedTeams(TeamTO.convertTeamList(hostTeamInfo.getMeetedTeams()));
			addHostTeam(hostTeamTO);
		}
	}
	
	public TeamTO getTeam() {
		return team;
	}

	public void setTeam(TeamTO team) {
		this.team = team;
	}

	public List<TeamTO> getGuestTeams() {
		return guestTeams;
	}

	public void setGuestTeams(List<TeamTO> guestTeams) {
		this.guestTeams = guestTeams;
	}

	public List<HostTeamTO> getHostTeams() {
		return hostTeams;
	}

	public void setHostTeams(List<HostTeamTO> hostTeams) {
		this.hostTeams = hostTeams;
	}
	
	public void addHostTeam(final HostTeamTO hostTeamTO) {
		this.hostTeams.add(hostTeamTO);
	}
	
}
