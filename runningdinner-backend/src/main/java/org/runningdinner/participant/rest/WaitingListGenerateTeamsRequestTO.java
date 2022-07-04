package org.runningdinner.participant.rest;

import java.util.ArrayList;
import java.util.List;

public class WaitingListGenerateTeamsRequestTO {

	private List<ParticipantTO> participants = new ArrayList<>();

	public WaitingListGenerateTeamsRequestTO() {
	}

	public WaitingListGenerateTeamsRequestTO(List<ParticipantTO> participants) {
		this.participants = participants;
	}

	public List<ParticipantTO> getParticipants() {
		return participants;
	}

	public void setParticipants(List<ParticipantTO> participants) {
		this.participants = participants;
	}

}
