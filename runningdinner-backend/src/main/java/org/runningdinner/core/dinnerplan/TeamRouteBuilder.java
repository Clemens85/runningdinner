package org.runningdinner.core.dinnerplan;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.MealClassSorter;
import org.runningdinner.participant.Team;

public class TeamRouteBuilder {

	/**
	 * Returns a list which contains per each meal the host-teams for the passed team and also the team itself in the correct order.
	 * The list is ordered by the times of the meals, so it can e.g. be happen the the passed team is in the middle of the list (e.g. if it
	 * cooks the main-course)
	 * 
	 * @param team
	 * @return
	 */
	public static List<Team> generateDinnerRoute(final Team team) {

		Map<MealClass, Team> mealTeamMapping = new HashMap<MealClass, Team>();
		mealTeamMapping.put(team.getMealClass(), team);

		Set<Team> hostTeams = team.getHostTeams();
		for (Team hostTeam : hostTeams) {
			mealTeamMapping.put(hostTeam.getMealClass(), hostTeam);
		}

		List<MealClass> allMeals = new ArrayList<MealClass>(mealTeamMapping.keySet());
		Collections.sort(allMeals, new MealClassSorter());

		ArrayList<Team> teamDinnerRoute = new ArrayList<Team>();
		for (MealClass orderedMeal : allMeals) {
			teamDinnerRoute.add(mealTeamMapping.get(orderedMeal));
		}

		return teamDinnerRoute;
	}

	/**
	 * Returns a list with all teams that the passed team sees on the running dinner.<br>
	 * This includes of course all guest and host teams, but also all other teams that meet up at the host teams.
	 * 
	 * @param team
	 * @return
	 */
	public static Collection<Team> getAllCrossedTeams(final Team team) {
		Collection<Team> result = new HashSet<Team>();

		Set<Team> guestTeams = team.getGuestTeams();
		Set<Team> hostTeams = team.getHostTeams();
		result.addAll(guestTeams);
		result.addAll(hostTeams);

		for (Team hostTeam : hostTeams) {
			Set<Team> guestTeamsOfHostTeam = hostTeam.getGuestTeams();
			for (Team guestTeamOfHostTeam : guestTeamsOfHostTeam) {
				// The passed team is of course also a host team and shall not be added
				if (!guestTeamOfHostTeam.equals(team)) {
					result.add(guestTeamOfHostTeam);
				}
			}
		}

		return result;
	}

}
