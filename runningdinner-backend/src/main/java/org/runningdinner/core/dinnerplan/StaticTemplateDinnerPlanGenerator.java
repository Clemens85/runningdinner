package org.runningdinner.core.dinnerplan;

import org.runningdinner.core.GeneratedTeamsResult;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamCombinationInfo;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Team;

import java.util.*;
import java.util.Map.Entry;

public class StaticTemplateDinnerPlanGenerator implements DinnerPlanGenerator {

	@Override
	public void generateDinnerExecutionPlan(GeneratedTeamsResult generatedTeams, RunningDinnerConfig runningDinnerConfig) {

		final List<Team> teams = generatedTeams.getRegularTeams();
		final TeamCombinationInfo teamCombinationInfo = generatedTeams.getTeamCombinationInfo();
		final Collection<MealClass> mealClasses = runningDinnerConfig.getMealClasses();

		final Map<Integer, Integer> teamSizeFactorizations = teamCombinationInfo.getTeamSizeFactorizations();

		final TeamSegmentTemplateMatrix templateMatrix = new TeamSegmentTemplateMatrix(mealClasses);

		final Map<MealClass, Queue<Team>> teamsByMealMapping = getTeamsByMealMapping(teams);

		for (Entry<Integer, Integer> teamSizeFactorizationEntry : teamSizeFactorizations.entrySet()) {
			Integer teamSegmentSize = teamSizeFactorizationEntry.getKey();
			Integer numSegments = teamSizeFactorizationEntry.getValue();

			if (numSegments.intValue() <= 0) {
				continue;
			}

			for (int i = 0; i < numSegments.intValue(); i++) {
				int[][][] matrix = templateMatrix.getTemplateMatrix(teamSegmentSize.intValue());
				buildVisitationPlansForTeamSegmentMatrix(matrix, teamsByMealMapping);
			}

		}
	}

	/**
	 * Gets a mapping for each meal with the teams that have to cook it. E.g.:<br>
	 * APPETIZER => Team1, Team2<br>
	 * MAINCOURSE => Team3, Team4
	 * 
	 * @param teams
	 * @return
	 */
	protected Map<MealClass, Queue<Team>> getTeamsByMealMapping(List<Team> teams) {
		Map<MealClass, Queue<Team>> result = new HashMap<MealClass, Queue<Team>>();
		for (Team team : teams) {
			MealClass mealClass = team.getMealClass();
			CoreUtil.assertNotNull(mealClass, "Team must have an assigned MealClass, but was null");
			Queue<Team> mappedTeamList = result.get(mealClass);
			if (mappedTeamList == null) {
				mappedTeamList = new ArrayDeque<Team>();
				result.put(mealClass, mappedTeamList);
			}
			mappedTeamList.add(team);
		}
		return result;
	}

	protected void buildVisitationPlansForTeamSegmentMatrix(int[][][] matrix, Map<MealClass, Queue<Team>> teamsByMealMapping) {

		List<MealClass> mealClasses = new ArrayList<MealClass>(teamsByMealMapping.keySet());
		CoreUtil.assertHasSize(mealClasses, matrix.length, "Expected number of mealclasses (" + mealClasses.size()
				+ ") to have size of matrix: " + matrix.length);

		Collections.shuffle(mealClasses); // Randomness is our friend :-)

		// Get to know which blocks in the matrix represent the hosting sequzence of a meal:
		Map<Integer, MealClass> matrixHosterMealMapping = new HashMap<Integer, MealClass>();
		for (int i = 0; i < matrix.length; i++) {
			MealClass mealClass = mealClasses.get(i);
			matrixHosterMealMapping.put(i, mealClass);
		}

		// Now map each number in the matrix to a team:
		Map<Integer, Team> teamToMatrixNumberMapping = new HashMap<Integer, Team>();
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

				teamToMatrixNumberMapping.put(hosterNumber, team);
			}
		}

		// Check consistency:
		int blockSize = matrix.length;
		int hostingTeamsSizeInBlock = matrix[0].length;
		CoreUtil.assertHasSize(teamToMatrixNumberMapping.keySet(), blockSize * hostingTeamsSizeInBlock, "There should have been taken "
				+ (blockSize * hostingTeamsSizeInBlock) + " teams, but it had been actually " + teamToMatrixNumberMapping.keySet().size());

		// Now we can finally build up the visitation plans as we know the team behind each number in matrix:
		for (int i = 0; i < matrix.length; i++) {
			int[][] hostingTeamToGuestTeamMappings = matrix[i];

			for (int j = 0; j < hostingTeamToGuestTeamMappings.length; j++) {

				int[] hostingTeamToGuestTeamMapping = hostingTeamToGuestTeamMappings[j];
				int hostingTeamNumber = hostingTeamToGuestTeamMapping[0];
				Team hostingTeam = teamToMatrixNumberMapping.get(hostingTeamNumber);

				for (int k = 1; k < hostingTeamToGuestTeamMapping.length; k++) {
					int guestTeamNumber = hostingTeamToGuestTeamMapping[k];
					Team guestTeam = teamToMatrixNumberMapping.get(guestTeamNumber);
					guestTeam.addHostTeam(hostingTeam);
				}
			}
		}
	}

}
