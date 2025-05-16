package org.runningdinner.dinnerroute.optimization.local;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;

public interface LocalClusterOptimizationStrategy {
	
	LocalClusterOptimizationStrategy init(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances);
	
	boolean isNewMinimum(AllDinnerRoutesWithDistancesListTO allRoutesWithDistances);
}
