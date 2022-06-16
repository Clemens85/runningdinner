package org.runningdinner.participant.rest;

import java.util.ArrayList;
import java.util.List;

public class TeamParticipantsAssignmentListTO {

	private List<TeamParticipantsAssignmentTO> teamParticipantsAssignments = new ArrayList<>();

	public List<TeamParticipantsAssignmentTO> getTeamParticipantsAssignments() {
		return teamParticipantsAssignments;
	}

	public void setTeamParticipantsAssignments(List<TeamParticipantsAssignmentTO> teamParticipantsAssignments) {
		this.teamParticipantsAssignments = teamParticipantsAssignments;
	}
	
}
