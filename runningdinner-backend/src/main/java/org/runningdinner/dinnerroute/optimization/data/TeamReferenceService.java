package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.DinnerRouteTeamTO;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationUtil;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class TeamReferenceService {

	private final DinnerRouteService dinnerRouteService;

	private final TeamService teamService;

	public TeamReferenceService(DinnerRouteService dinnerRouteService, TeamService teamService) {
		this.dinnerRouteService = dinnerRouteService;
		this.teamService = teamService;
	}

	public TeamReferenceResultList findTeamReferences(RunningDinner runningDinner, boolean imputeMissingGeocodes) {
		DinnerRouteListTO dinnerRouteList = dinnerRouteService.findAllDinnerRoutes(runningDinner.getAdminId());
		List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);

		List<TeamReference> result = new ArrayList<>();
		for (var dinnerRoute : dinnerRouteList.getDinnerRoutes()) {
			Team currentTeam = IdentifierUtil.filterListForIdMandatory(allTeams, dinnerRoute.getCurrentTeam().getId());

			List<TeamReference> teamsOnRoute = new ArrayList<>();
			for (DinnerRouteTeamTO teamOnRoute : dinnerRoute.getTeams()) {
				Team rawTeamOnRoute = teamOnRoute.getRawTeam();
				if (rawTeamOnRoute.isSameId(currentTeam.getId())) {
					continue;
				}
				teamsOnRoute.add(mapToTeamReference(rawTeamOnRoute, dinnerRouteList, Collections.emptyList()));
			}

			result.add(mapToTeamReference(currentTeam, dinnerRouteList, teamsOnRoute));
		}

		if (imputeMissingGeocodes) {
			result = DinnerRouteOptimizationUtil.imputeMissingGeocodingResults(result);
		}
		return new TeamReferenceResultList(result, dinnerRouteList);
	}

	public static List<MealReference> mapMealReferences(RunningDinner runningDinner) {
		return runningDinner.getConfiguration().getMealClasses()
					.stream()
					.map(TeamReferenceService::mapMealReference)
					.toList();
	}

	public static List<Team> getTeamsFromReferences(List<TeamReference> optimizedTeams, Map<TeamReference, Team> teamReferencesToTeams) {
		return optimizedTeams
						.stream()
						.map(teamReferencesToTeams::get)
						.toList();
	}

	public static Map<TeamReference, Team> mapTeamReferencesToTeams(List<TeamReference> optimizedTeams, List<Team> existingTeams) {
		Map<TeamReference, Team> result = new HashMap<>();
		for (TeamReference teamReference : optimizedTeams) {
			Team team = existingTeams.stream()
																.filter(t -> t.isSameId(teamReference.teamId()))
																.findFirst()
																.orElseThrow(() -> new IllegalStateException("Could not find team for TeamReference: " + teamReference));
			result.put(teamReference, team);
		}
		return result;
	}

	private static MealReference mapMealReference(MealClass mealClass) {
		return new MealReference(mealClass.getId(), mealClass.getLabel());
	}

	private static TeamReference mapToTeamReference(Team currentTeam, DinnerRouteListTO dinnerRouteList, List<TeamReference> teamsOnRoute) {

		MealReference mealReference = mapMealReference(currentTeam.getMealClass());

		GeocodingResult geocodingResult = currentTeam.getHostTeamMember().getGeocodingResult();

		int clusterNumber = findTeamClusterNumber(dinnerRouteList, currentTeam);

		return new TeamReference(
						currentTeam.getTeamNumber(),
						currentTeam.getId(),
						mealReference,
						currentTeam.getStatus(),
						geocodingResult,
						clusterNumber,
						teamsOnRoute
		);
	}

	private static int findTeamClusterNumber(DinnerRouteListTO dinnerRouteList, Team currentTeam) {
		Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = dinnerRouteList.getTeamClusterMappings();
		for (Map.Entry<Integer, LinkedHashSet<Integer>> entry : teamClusterMappings.entrySet()) {
			if (entry.getValue().contains(currentTeam.getTeamNumber())) {
				return entry.getKey();
			}
		}
		throw new IllegalStateException("Could not find team cluster for team " + currentTeam.getTeamNumber() + " in " + teamClusterMappings);
	}
}
