package org.runningdinner.core;

import java.util.List;

public interface BasicRunningDinnerConfiguration {
	
	/**
	 * Contains all meals to cook for a running dinner
	 * 
	 * @return
	 */
	List<MealClass> getMealClasses();
	
	/**
	 * Number of all meals to cook for a running dinner
	 * @return
	 */
	int getNumberOfMealClasses(); 
	
	/**
	 * Determines how many participants are mixed up into one team. Typcially this should be 2.
	 * 
	 * @return
	 */
	int getTeamSize();
	
	TeamCombinationInfo generateTeamCombinationInfo(final int numberOfTeams) throws NoPossibleRunningDinnerException;
}
