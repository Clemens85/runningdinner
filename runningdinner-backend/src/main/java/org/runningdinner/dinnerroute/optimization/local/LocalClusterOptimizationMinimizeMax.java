package org.runningdinner.dinnerroute.optimization.local;

import java.util.List;
import java.util.Optional;
import java.util.function.BiPredicate;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteTeamWithDistanceTO;
import org.runningdinner.dinnerroute.DinnerRouteWithDistancesTO;

public class LocalClusterOptimizationMinimizeMax implements LocalClusterOptimizationStrategy {
	
	private Double bestMaxDistanceInMeters = null;
	
	@Override
	public LocalClusterOptimizationMinimizeMax init(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances) {
		this.bestMaxDistanceInMeters = geMaxDistanceInAllRoutes(allRoutesWithDistances).orElse(null);
		return this;
	}
	
	@Override
	public boolean isNewMinimum(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances) {
		Double maxDistanceInMeters = geMaxDistanceInAllRoutes(allRoutesWithDistances).orElse(null);
		if (canUseAsNewMaxOrMin(bestMaxDistanceInMeters, maxDistanceInMeters, (oldVal, newVal) -> newVal < oldVal)) {
			bestMaxDistanceInMeters = maxDistanceInMeters;
			return true;
		}
		return false;
	}	
	
	private static Optional<Double> geMaxDistanceInAllRoutes(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances) {
		
		Double result = null;
		List<DinnerRouteWithDistancesTO> dinnerRoutes = allRoutesWithDistances.dinnerRoutes();
		for (var singleDinnerRoute : dinnerRoutes) {
			Double maxDistanceInSingleRoute = geMaxDistanceInSingleRoute(singleDinnerRoute);
			if (canUseAsNewMaxOrMin(result, maxDistanceInSingleRoute, (oldVal, newVal) -> newVal > oldVal)) {
				result = maxDistanceInSingleRoute;
			}
		}
		return Optional.ofNullable(result);
	}
	
	private static boolean canUseAsNewMaxOrMin(Double oldValue, Double newValue, BiPredicate<Double, Double> comparator) {
		if (oldValue == null && newValue == null) {
			return false;
		}
		if (oldValue == null && newValue != null) {
			return true;
		}
		if (newValue != null && oldValue != null && comparator.test(oldValue, newValue)) {
			return true;
		}
		return false;
	}
	
	private static Double geMaxDistanceInSingleRoute(DinnerRouteWithDistancesTO dinnerRoute) {
		DinnerRouteTeamWithDistanceTO teamWithLargestDistance = dinnerRoute.teams()
																															.stream()
																															.filter(t -> t.isLargestDistanceInRoute())
																															.findFirst()
																															.orElse(null);
		if (teamWithLargestDistance == null || teamWithLargestDistance.getDistanceToNextTeam() == null) {
			return null;
		}
		return teamWithLargestDistance.getDistanceToNextTeam();
	}
}
