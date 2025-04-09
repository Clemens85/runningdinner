package org.runningdinner.dinnerroute.optimization;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.runningdinner.core.MealClass;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.util.Assert;

import net.logstash.logback.encoder.org.apache.commons.lang3.StringUtils;

public class DinnerRouteOptimizationUtil {

	private DinnerRouteOptimizationUtil() {
		// NOP
	}
	
	public static double[][] mapTeamLocationsToDistanceMatrix(List<TeamHostLocation> teamLocations) {
		
		var numLocations = teamLocations.size();
		
		double[][] result = new double[numLocations][numLocations];
		
    for (int i = 0; i < numLocations; i++) {
      for (int j = i + 1; j < numLocations; j++) {
      	double distance = DistanceCalculator.calculateDistanceVincentyInMeters(teamLocations.get(i), teamLocations.get(j));
      	result[i][j] = result[j][i] = distance;
      }
    }
		
		return result;
	}
	
	public static Map<MealClass, Integer> calculateMealsDistributionForClusterSize(List<MealClass> mealClasses, int teamClusterSize) {
		int sumPerEachMealClass = teamClusterSize / mealClasses.size();
		Assert.state(teamClusterSize % mealClasses.size() == 0, "TODO");
		
		Map<MealClass, Integer> result = new HashMap<>();
		for (MealClass mealClass : mealClasses) {
			result.put(mealClass, sumPerEachMealClass);
		}
		return result;
	}
	
	public static void addMissingGeocodesToTeams(List<Team> teams, List<TeamHostLocation> teamHostLocations) {
		
		for (Team team : teams) {
			Participant hostTeamMember = team.getHostTeamMember();
			if (GeocodingResult.isValid(hostTeamMember.getGeocodingResult())) {
				continue;
			}
			TeamHostLocation teamHostLocation = findTeamHostLocationForTeamNumber(String.valueOf(team.getTeamNumber()), teamHostLocations);
			hostTeamMember.setGeocodingResult(new GeocodingResult(teamHostLocation));
		}
	}
	
  private static TeamHostLocation findTeamHostLocationForTeamNumber(String teamNumberStr, List<TeamHostLocation> teamHostLocations) {
    return teamHostLocations
            .stream()
            .filter(teamHostLocation -> StringUtils.equals(teamHostLocation.getId(), teamNumberStr))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find teamHostLocation with teamNumber " + teamNumberStr + " within teams " + teamHostLocations));
  }

}
