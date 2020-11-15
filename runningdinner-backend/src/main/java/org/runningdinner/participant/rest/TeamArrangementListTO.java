package org.runningdinner.participant.rest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class TeamArrangementListTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private List<TeamTO> teams = new ArrayList<>();

	private String dinnerAdminId;

	public TeamArrangementListTO() {
		super();
	}

	public TeamArrangementListTO(List<TeamTO> teams, String dinnerAdminId) {
		super();
		this.teams = teams;
		this.dinnerAdminId = dinnerAdminId;
	}

	public List<TeamTO> getTeams() {
		return teams;
	}

	public void setTeams(List<TeamTO> teams) {
		this.teams = teams;
	}

	public String getDinnerAdminId() {
		return dinnerAdminId;
	}

	public void setDinnerAdminId(String dinnerAdminId) {
		this.dinnerAdminId = dinnerAdminId;
	}

	public void addTeam(final TeamTO team) {
		this.teams.add(team);
	}

}
