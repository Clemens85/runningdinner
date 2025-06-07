package org.runningdinner.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.runningdinner.participant.Participant;

/**
 * Simple helper object for saving information about combining teams
 * 
 * @author Clemens Stich
 * 
 */
public class TeamCombinationInfo {

	private final int numMeals;
	private final int numberOfTeams;

	private int minimumTeamsNeeded;
	private int numRemaindingTeams;

	protected TeamCombinationInfo(int numberOfPossibleTeams, int numMeals) throws NoPossibleRunningDinnerException {

		// I need at least this number of teams to get a valid running dinner team-combination:
		this.minimumTeamsNeeded = numMeals * numMeals;
		if (this.minimumTeamsNeeded > numberOfPossibleTeams) {
			throw new NoPossibleRunningDinnerException("Too few number of teams (" + numberOfPossibleTeams + ") for performing a running dinner without violating the rules!");
		}

		this.numRemaindingTeams = numberOfPossibleTeams % numMeals;

		// This is the number of teams that we really can build:
		this.numberOfTeams = numberOfPossibleTeams - numRemaindingTeams;

		this.numMeals = numMeals;
	}
	
	public static TeamCombinationInfo newInstance(BasicRunningDinnerConfiguration runningDinnerConfig, List<Participant> allParticipants) throws NoPossibleRunningDinnerException {
		int numberOfTeams = allParticipants.size() / runningDinnerConfig.getTeamSize();
		return newInstance(runningDinnerConfig, numberOfTeams);
	}	
	
	public static TeamCombinationInfo newInstance(BasicRunningDinnerConfiguration runningDinnerConfig, int numberOfTeams) throws NoPossibleRunningDinnerException {
		return new TeamCombinationInfo(numberOfTeams, runningDinnerConfig.getNumberOfMealClasses());
	}

	/**
	 * Returns an ordered list with the team sizes that we need to deal with for handling all possible team size combinations.<br>
	 * If we have e.g. three meals, we get the list [9,12,15] as these are the possible team size segments that can happen.
	 * 
	 * @return
	 */
	List<Integer> getCombinationFactors() {
		List<Integer> combinationFactors = new ArrayList<Integer>();

		final int factorizationLimiter = minimumTeamsNeeded * 2;

		int combinationFactor = minimumTeamsNeeded;
		while (combinationFactor < factorizationLimiter) {
			combinationFactors.add(combinationFactor);
			combinationFactor += numMeals;
		}

		return combinationFactors;
	}

	/**
	 * Computes the number of the sizes of the teams. If we have e.g. 21 teams and 3 meals then we get following results:<br>
	 * [9] => 1<br>
	 * [12] => 1<br>
	 * [15] => 0<br>
	 * This means that we have to build 1 segment-size of 9 teams, 1 segment-size of 12 teams and 0 segments of 15 teams.
	 * 
	 * @return
	 */
	public Map<Integer, Integer> getTeamSizeFactorizations() {

		final List<Integer> combinationFactors = getCombinationFactors();

		Map<Integer, Integer> result = new HashMap<Integer, Integer>();
		for (Integer combinationFactor : combinationFactors) {
			result.put(combinationFactor, 0);
		}

		if (combinationFactors.contains(numberOfTeams)) {
			result.put(numberOfTeams, 1);
			return result;
		}

		// Start values:
		int smallestFactor = combinationFactors.get(0);
		int cumulatedValue = smallestFactor;
		result.put(smallestFactor, 1);

		boolean foundFactors = false;
		while (!foundFactors || cumulatedValue < numberOfTeams) {

			for (Integer combinationFactor : combinationFactors) {
				if (cumulatedValue + combinationFactor == numberOfTeams) {
					int count = result.get(combinationFactor).intValue();
					result.put(combinationFactor, Integer.valueOf(count + 1));

					cumulatedValue += combinationFactor;

					foundFactors = true;
					break;
				}
			}

			if (foundFactors) {
				break;
			}

			cumulatedValue += smallestFactor;
			int count = result.get(smallestFactor);
			result.put(smallestFactor, Integer.valueOf(count + 1));
		}

		return result;
	}

	/**
	 * The number of teams that must be excluded for building a complete running dinner execution plan.<br>
	 * This must be once computed based on the number of possible teams and the number of meals to cook.
	 *
	 * @return
	 */
	public int getNumRemaindingTeams() {
		return this.numRemaindingTeams;
	}

	@Override
	public String toString() {
		return "numberOfTeams=" + numberOfTeams + ", numRemaindingTeams=" + numRemaindingTeams + ", numMeals=" + numMeals
				+ ", team-combinations=" + getCombinationFactors();
	}

}
