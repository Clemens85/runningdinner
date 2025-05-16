package org.runningdinner.dinnerroute.optimization.local;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;

public class LocalClusterOptimizationMinimizeSum implements LocalClusterOptimizationStrategy {

	private double bestSumDistanceInMeters = Double.MAX_VALUE;
	
	@Override
	public LocalClusterOptimizationMinimizeSum init(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances) {
		this.bestSumDistanceInMeters = allRoutesWithDistances.sumDistanceInMeters() != null ? allRoutesWithDistances.sumDistanceInMeters() : Double.MAX_VALUE;
		return this;
	}
	
	@Override
	public boolean isNewMinimum(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances) {
		Double sumDistanceInMeters = allRoutesWithDistances.sumDistanceInMeters();
		if (sumDistanceInMeters != null && sumDistanceInMeters < bestSumDistanceInMeters) {
			bestSumDistanceInMeters = sumDistanceInMeters;
			return true;
		}
		return false;
	}
}
