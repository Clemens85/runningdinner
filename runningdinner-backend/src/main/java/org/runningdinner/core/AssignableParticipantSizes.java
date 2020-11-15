package org.runningdinner.core;

public class AssignableParticipantSizes {

	private int minimumParticipantsNeeded;
	private int nextParticipantsOffsetSize;

	protected AssignableParticipantSizes() {

	}

	public int getMinimumParticipantsNeeded() {
		return minimumParticipantsNeeded;
	}

	public int getNextParticipantsOffsetSize() {
		return nextParticipantsOffsetSize;
	}

	public static AssignableParticipantSizes create(BasicRunningDinnerConfiguration runningDinnerConfig) {

		int numMeals = runningDinnerConfig.getMealClasses().size();
		int teamSize = runningDinnerConfig.getTeamSize();

		AssignableParticipantSizes result = new AssignableParticipantSizes();
		result.minimumParticipantsNeeded = (numMeals * numMeals) * teamSize;
		result.nextParticipantsOffsetSize = numMeals * teamSize;
		return result;
	}
}
