package org.runningdinner.dataimport;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.participant.rest.ParticipantInputDataTO;

import jakarta.validation.Valid;

public record ParticipantInputDataListTO(@Valid List<ParticipantInputDataTO> participants) {
	
	public ParticipantInputDataListTO() {
		this(new ArrayList<>());
	}
}
