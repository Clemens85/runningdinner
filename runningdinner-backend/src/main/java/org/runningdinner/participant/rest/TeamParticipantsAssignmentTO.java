package org.runningdinner.participant.rest;

import com.google.common.base.MoreObjects;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class TeamParticipantsAssignmentTO {

	@NotNull
	private UUID teamId;
	
	private List<UUID> participantIds = new ArrayList<>();

	public UUID getTeamId() {
		return teamId;
	}

	public void setTeamId(UUID teamId) {
		this.teamId = teamId;
	}

	public List<UUID> getParticipantIds() {
		return participantIds;
	}

	public void setParticipantIds(List<UUID> participantIds) {
		this.participantIds = participantIds;
	}

	@Override
	public String toString() {
		return MoreObjects.toStringHelper(this)
											.add("teamId", teamId)
											.add("participantIds", participantIds)
											.toString();
	}
}
