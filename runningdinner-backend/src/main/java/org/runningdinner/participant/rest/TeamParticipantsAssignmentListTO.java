package org.runningdinner.participant.rest;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

public class TeamParticipantsAssignmentListTO {

	@NotEmpty
	@NotNull
	@Valid
	private List<TeamParticipantsAssignmentTO> teamParticipantsAssignments = new ArrayList<>();

	public List<TeamParticipantsAssignmentTO> getTeamParticipantsAssignments() {
		return teamParticipantsAssignments;
	}

	public void setTeamParticipantsAssignments(List<TeamParticipantsAssignmentTO> teamParticipantsAssignments) {
		this.teamParticipantsAssignments = teamParticipantsAssignments;
	}
	
}
