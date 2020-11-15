package org.runningdinner.participant.rest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

public class TeamTO extends BaseTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private int teamNumber;

	private TeamStatus status;
	
	protected List<ParticipantTO> teamMembers;

	protected MealTO meal;

	protected ParticipantTO hostTeamMember;

	public TeamTO() {
		
	}

	public TeamTO(Team team) {
		super(team);
		this.setStatus(team.getStatus());
		this.setTeamNumber(team.getTeamNumber());
		this.setMeal(new MealTO(team.getMealClass()));
		
		Participant hostTeamMemberTmp = team.getHostTeamMember();
		if (hostTeamMemberTmp != null) {
		  this.setHostTeamMember(new ParticipantTO(hostTeamMemberTmp));
		}
		
		this.setTeamMembers(ParticipantTO.convertParticipantList(team.getTeamMembers()));
	}

	public int getTeamNumber() {
		return teamNumber;
	}

	public void setTeamNumber(int teamNumber) {
		this.teamNumber = teamNumber;
	}

	public List<ParticipantTO> getTeamMembers() {
		return teamMembers;
	}

	public void setTeamMembers(List<ParticipantTO> teamMembers) {
		this.teamMembers = teamMembers;
	}

	public MealTO getMeal() {
		return meal;
	}

	public void setMeal(MealTO meal) {
		this.meal = meal;
	}

	public ParticipantTO getHostTeamMember() {
		return hostTeamMember;
	}

	public void setHostTeamMember(ParticipantTO hostTeamMember) {
		this.hostTeamMember = hostTeamMember;
	}

	public TeamStatus getStatus() {
		return status;
	}

	public void setStatus(TeamStatus status) {
		this.status = status;
	}

	@Override
	public String toString() {
		return "teamNumber=" + teamNumber + ", meal=" + meal;
	}

	public static List<TeamTO> convertTeamList(final Collection<Team> teams) {
		List<TeamTO> result = new ArrayList<>(teams.size());
		for (Team t : teams) {
			result.add(new TeamTO(t));
		}
		return result;
	}

}
