package org.runningdinner.core.dinnerplan;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamCombinationInfo;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Team;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Queue;

public final class StaticTemplateDinnerPlanGenerator {
	
	private StaticTemplateDinnerPlanGenerator() {
		// NOP
	}

	public static void generateDinnerExecutionPlan(List<Team> teams, RunningDinnerConfig runningDinnerConfig) throws NoPossibleRunningDinnerException {

		final TeamCombinationInfo teamCombinationInfo = TeamCombinationInfo.newInstance(runningDinnerConfig, teams.size()); 
		final Collection<MealClass> mealClasses = runningDinnerConfig.getMealClasses();

		final Map<Integer, Integer> teamSizeFactorizations = teamCombinationInfo.getTeamSizeFactorizations();

		final TeamSegmentTemplateMatrix templateMatrix = new TeamSegmentTemplateMatrix(mealClasses);

		final Map<MealClass, Queue<Team>> teamsByMealMapping = getTeamsByMealMapping(teams);

		final DinnerRouteDraft routeDraft = new DinnerRouteDraft();

		for (Entry<Integer, Integer> teamSizeFactorizationEntry : teamSizeFactorizations.entrySet()) {
			Integer teamSegmentSize = teamSizeFactorizationEntry.getKey();
			Integer numSegments = teamSizeFactorizationEntry.getValue();

			if (numSegments <= 0) {
				continue;
			}

			for (int i = 0; i < numSegments; i++) {
				int[][][] matrix = templateMatrix.getTemplateMatrix(teamSegmentSize);
				addTeamSegmentMatrix(matrix, teamsByMealMapping, routeDraft);
			}
		}

		CoreUtil.assertHasSize(routeDraft.slots(), teams.size(),
				"Expected all " + teams.size() + " teams to be placed into the template matrices, but placed " + routeDraft.size());

		new AccessibilityRouteOptimizer(routeDraft, runningDinnerConfig).optimize();
		routeDraft.applyVisits();
	}
	

	/**
	 * Gets a mapping for each meal with the teams that have to cook it. E.g.:<br>
	 * APPETIZER => Team1, Team2<br>
	 * MAINCOURSE => Team3, Team4
	 *
	 */
	private static Map<MealClass, Queue<Team>> getTeamsByMealMapping(List<Team> teams) {
		Map<MealClass, Queue<Team>> result = new HashMap<MealClass, Queue<Team>>();
		for (Team team : teams) {
			MealClass mealClass = team.getMealClass();
			CoreUtil.assertNotNull(mealClass, "Team must have an assigned MealClass, but was null");
			Queue<Team> mappedTeamList = result.computeIfAbsent(mealClass, k -> new ArrayDeque<Team>());
			mappedTeamList.add(team);
		}
		return result;
	}

	/**
	 * Places the teams into the slots of the passed matrix and collects the visits (guest slot -> host slot) of this matrix.
	 * The slots of each matrix are appended to the passed slot arrangement.
	 */
	private static void addTeamSegmentMatrix(int[][][] matrix, Map<MealClass, Queue<Team>> teamsByMealMapping, DinnerRouteDraft routeDraft) {

		List<MealClass> mealClasses = new ArrayList<MealClass>(teamsByMealMapping.keySet());
		CoreUtil.assertHasSize(mealClasses, matrix.length, "Expected number of mealclasses (" + mealClasses.size()
				+ ") to have size of matrix: " + matrix.length);

		Collections.shuffle(mealClasses); // Randomness is our friend :-)

		// Get to know which blocks in the matrix represent the hosting sequence of a meal:
		Map<Integer, MealClass> matrixHosterMealMapping = new HashMap<Integer, MealClass>();
		for (int i = 0; i < matrix.length; i++) {
			MealClass mealClass = mealClasses.get(i);
			matrixHosterMealMapping.put(i, mealClass);
		}

		// Now map each number in the matrix to a team:
		Map<Integer, DinnerRouteDraft.Slot> matrixNumberToSlot = new HashMap<>();
		for (int i = 0; i < matrix.length; i++) {

			int[][] mealRow = matrix[i];
			for (int j = 0; j < mealRow.length; j++) {

				final int hosterNumber = mealRow[j][0]; // First number is always hoster!
				final MealClass mealClassOfHoster = matrixHosterMealMapping.get(i);
				Queue<Team> teamsWithMeal = teamsByMealMapping.get(mealClassOfHoster);

				Team team = teamsWithMeal.poll();
				if (team == null) {
					throw new IllegalStateException("No more teams left on teamsByMealMapping which may never happen. MealClass="
							+ mealClassOfHoster + ", Matrix was: " + Arrays.deepToString(matrix));
				}

				matrixNumberToSlot.put(hosterNumber, routeDraft.addSlot(team, mealClassOfHoster));
			}
		}

		// Check consistency:
		int blockSize = matrix.length;
		int hostingTeamsSizeInBlock = matrix[0].length;
		CoreUtil.assertHasSize(matrixNumberToSlot.keySet(), blockSize * hostingTeamsSizeInBlock, "There should have been taken "
				+ (blockSize * hostingTeamsSizeInBlock) + " teams, but it had been actually " + matrixNumberToSlot.size());

		// Now we can collect the visits as we know the slot behind each number in matrix:
		for (int i = 0; i < matrix.length; i++) {
			int[][] hostingTeamToGuestTeamMappings = matrix[i];

			for (int j = 0; j < hostingTeamToGuestTeamMappings.length; j++) {

				int[] hostingTeamToGuestTeamMapping = hostingTeamToGuestTeamMappings[j];
				DinnerRouteDraft.Slot hostingSlot = matrixNumberToSlot.get(hostingTeamToGuestTeamMapping[0]);

				for (int k = 1; k < hostingTeamToGuestTeamMapping.length; k++) {
					DinnerRouteDraft.Slot guestSlot = matrixNumberToSlot.get(hostingTeamToGuestTeamMapping[k]);
					routeDraft.addVisit(guestSlot, hostingSlot);
				}
			}
		}

	}

}
