package org.runningdinner.dinnerroute.distance;

import java.util.List;

import org.runningdinner.dinnerroute.DinnerRouteTeamWithDistanceTO;
import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteWithDistancesTO;

public final class DistanceUtil {
	
	private DistanceUtil() {
		
	}
	
	public static double calculateOverallAverageDistance(List<DinnerRouteWithDistancesTO> allRoutesWithDistances) {
    double sum = 0.0d;
    int count = 0;
    for (DinnerRouteWithDistancesTO dinnerRouteWithDistances : allRoutesWithDistances) {
      Double averageDistance = dinnerRouteWithDistances.averageDistanceInMeters();
      if (averageDistance != null) {
        sum += averageDistance;
        count++;
      }
    }
    return count > 0 ? sum / count : 0.0d;
	}

	public static double calculateOverallSumDistance(List<DinnerRouteWithDistancesTO> allRoutesWithDistances) {
    double sum = 0.0d;
    for (DinnerRouteWithDistancesTO dinnerRouteWithDistances : allRoutesWithDistances) {
    	Double distance = calculateSumDistance(dinnerRouteWithDistances.teams());
      if (distance != null) {
        sum += distance;
      }
    }
    return sum;
	}
	
	public static double calculateAverageDistance(List<DinnerRouteTeamWithDistanceTO> dinnerRouteTeamsWithDistances) {
    double sum = 0.0d;
    int count = 0;
    for (DinnerRouteTeamWithDistanceTO dinnerRouteTeamWithDistanceTO : dinnerRouteTeamsWithDistances) {
      Double distanceToNextTeam = dinnerRouteTeamWithDistanceTO.getDistanceToNextTeam();
      if (distanceToNextTeam != null) {
        sum += distanceToNextTeam;
        count++;
      }
    }
    return count > 0 ? sum / count : 0.0d;
	}
	

	public static Double calculateSumDistance(List<DinnerRouteTeamWithDistanceTO> dinnerRouteTeamsWithDistances) {
    Double sum = 0.0d;
    for (DinnerRouteTeamWithDistanceTO dinnerRouteTeamWithDistanceTO : dinnerRouteTeamsWithDistances) {
      Double distanceToNextTeam = dinnerRouteTeamWithDistanceTO.getDistanceToNextTeam();
      if (distanceToNextTeam != null) {
        sum += distanceToNextTeam;
      }
    }
    return sum;
	}
	
	public static void convertMetersToKilometers(AllDinnerRoutesWithDistancesListTO dinnerRouteWithDistancesList) {
		dinnerRouteWithDistancesList.dinnerRoutes()
			.stream()
			.forEach(route -> {
				route.teams().stream()
					.forEach(t -> t.setDistanceToNextTeam(metersToKilometers(t.getDistanceToNextTeam())));
			});
	}
	
	public static Double metersToKilometers(Double src) {
		return src != null ? (src / 1000) : null;
	}
	

}
