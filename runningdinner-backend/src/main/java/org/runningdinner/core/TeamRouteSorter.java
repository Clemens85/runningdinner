package org.runningdinner.core;

import java.util.Comparator;

import org.runningdinner.participant.Team;

public class TeamRouteSorter implements Comparator<Team> {

	MealClassSorter mealClassSorter = new MealClassSorter();

	@Override
	public int compare(Team team1, Team team2) {
		MealClass mealClass1 = team1.getMealClass();
		MealClass mealClass2 = team2.getMealClass();
		return mealClassSorter.compare(mealClass1, mealClass2);
	}

}
