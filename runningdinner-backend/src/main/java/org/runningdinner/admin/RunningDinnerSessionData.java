package org.runningdinner.admin;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.common.rest.SelectOptionTO;
import org.runningdinner.core.AssignableParticipantSizes;

public class RunningDinnerSessionData {

	private List<SelectOptionTO> genders = new ArrayList<>();

	private List<SelectOptionTO> registrationTypes = new ArrayList<>();

	private List<SelectOptionTO> genderAspects = new ArrayList<>();

	private int numSeatsNeededForHost;

	private AssignableParticipantSizes assignableParticipantSizes;

	public List<SelectOptionTO> getGenders() {
		return genders;
	}

	public void setGenders(List<SelectOptionTO> genders) {
		this.genders = genders;
	}

	public List<SelectOptionTO> getRegistrationTypes() {
		return registrationTypes;
	}

	public void setRegistrationTypes(List<SelectOptionTO> registrationTypes) {
		this.registrationTypes = registrationTypes;
	}

	public List<SelectOptionTO> getGenderAspects() {
		return genderAspects;
	}

	public void setGenderAspects(List<SelectOptionTO> genderAspects) {
		this.genderAspects = genderAspects;
	}

	public int getNumSeatsNeededForHost() {
		return numSeatsNeededForHost;
	}

	public void setNumSeatsNeededForHost(int numSeatsNeededForHost) {
		this.numSeatsNeededForHost = numSeatsNeededForHost;
	}

	public AssignableParticipantSizes getAssignableParticipantSizes() {
		return assignableParticipantSizes;
	}

	public void setAssignableParticipantSizes(AssignableParticipantSizes assignableParticipantSizes) {
		this.assignableParticipantSizes = assignableParticipantSizes;
	}

}
