package org.runningdinner.admin.activity;


public class Checklist {

	private boolean dinnerCreated = true;

	private boolean endOfRegistrationDate = false;

	private boolean participantMessagesSent = false;

	private boolean teamArrangementsCreated = false;

	private boolean teamMessagesSent = false;

	private boolean dinnerRouteMessagesSent = false;

	public boolean isDinnerCreated() {
		return dinnerCreated;
	}

	public void setDinnerCreated(boolean dinnerCreated) {
		this.dinnerCreated = dinnerCreated;
	}

	public boolean isEndOfRegistrationDate() {
		return endOfRegistrationDate;
	}

	public void setEndOfRegistrationDate(boolean endOfRegistrationDate) {
		this.endOfRegistrationDate = endOfRegistrationDate;
	}

	public boolean isParticipantMessagesSent() {
		return participantMessagesSent;
	}

	public void setParticipantMessagesSent(boolean participantMailsSent) {
		this.participantMessagesSent = participantMailsSent;
	}

	public boolean isTeamArrangementsCreated() {
		return teamArrangementsCreated;
	}

	public void setTeamArrangementsCreated(boolean teamArrangementsCreated) {
		this.teamArrangementsCreated = teamArrangementsCreated;
	}

	public boolean isTeamMessagesSent() {
		return teamMessagesSent;
	}

	public void setTeamMessagesSent(boolean teamMessagesSent) {
		this.teamMessagesSent = teamMessagesSent;
	}

	public boolean isDinnerRouteMessagesSent() {
		return dinnerRouteMessagesSent;
	}

	public void setDinnerRouteMessagesSent(boolean dinnerRouteMessagesSent) {
		this.dinnerRouteMessagesSent = dinnerRouteMessagesSent;
	}

	@Override
	public String toString() {
		return "dinnerCreated=" + dinnerCreated + ", endOfRegistrationDate=" + endOfRegistrationDate + ", participantMailsSent="
				+ participantMessagesSent + ", teamArrangementsCreated=" + teamArrangementsCreated + ", teamMessagesSent=" + teamMessagesSent
				+ ", dinnerRouteMessagesSent=" + dinnerRouteMessagesSent;
	}

}
