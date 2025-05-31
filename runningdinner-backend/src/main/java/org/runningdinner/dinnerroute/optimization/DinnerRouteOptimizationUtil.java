package org.runningdinner.dinnerroute.optimization;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.runningdinner.core.MealClass;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocation;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationList;
import org.springframework.util.Assert;

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
		Assert.state(teamClusterSize % mealClasses.size() == 0, "teamClusterSize " + teamClusterSize + " must be dividable by num meals " + mealClasses.size() + " but was not");
		
		Map<MealClass, Integer> result = new HashMap<>();
		for (MealClass mealClass : mealClasses) {
			result.put(mealClass, sumPerEachMealClass);
		}
		return result;
	}
	
	public static List<DinnerRouteTO> buildDinnerRoute(TeamHostLocationList teamHostLocationList, DinnerRouteCalculator dinnerRouteCalculator) {
  	List<DinnerRouteTO> optimizedDinnerRoutes = new ArrayList<>();
  	for (TeamHostLocation teamHostLocation : teamHostLocationList.getAllDinnerRouteTeamHostLocations()) {
    	DinnerRouteTO dinnerRoute = dinnerRouteCalculator.buildDinnerRoute(teamHostLocation.getTeam());
    	optimizedDinnerRoutes.add(dinnerRoute);
  	}
  	return optimizedDinnerRoutes;
	}
	

}
