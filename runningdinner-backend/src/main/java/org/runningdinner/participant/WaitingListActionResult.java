package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.participant.rest.TeamTO;

public class WaitingListActionResult {

	private List<TeamTO> affectedTeams = new ArrayList<>();

	private boolean teamMessagesAlreadySent;

	private boolean dinnerRouteMessagesAlreadySent;
	
	protected WaitingListActionResult() {
		// NOP
	}

	public WaitingListActionResult(List<TeamTO> affectedTeams, boolean teamMessagesAlreadySent, boolean dinnerRouteMessagesAlreadySent) {
		this.affectedTeams = affectedTeams;
		this.teamMessagesAlreadySent = teamMessagesAlreadySent;
		this.dinnerRouteMessagesAlreadySent = dinnerRouteMessagesAlreadySent;
	}

	public WaitingListActionResult(List<TeamTO> affectedTeams, List<Activity> activities) {
		this(affectedTeams, 
				ActivityService.containsActivityType(activities, ActivityType.TEAMARRANGEMENT_MAIL_SENT),
				ActivityService.containsActivityType(activities, ActivityType.DINNERROUTE_MAIL_SENT));
	}

	public List<TeamTO> getAffectedTeams() {
		return affectedTeams;
	}

	public void setAffectedTeams(List<TeamTO> affectedTeams) {
		this.affectedTeams = affectedTeams;
	}

	public boolean isTeamMessagesAlreadySent() {
		return teamMessagesAlreadySent;
	}

	public void setTeamMessagesAlreadySent(boolean teamMessagesAlreadySent) {
		this.teamMessagesAlreadySent = teamMessagesAlreadySent;
	}

	public boolean isDinnerRouteMessagesAlreadySent() {
		return dinnerRouteMessagesAlreadySent;
	}

	public void setDinnerRouteMessagesAlreadySent(boolean dinnerRouteMessagesAlreadySent) {
		this.dinnerRouteMessagesAlreadySent = dinnerRouteMessagesAlreadySent;
	}

}
