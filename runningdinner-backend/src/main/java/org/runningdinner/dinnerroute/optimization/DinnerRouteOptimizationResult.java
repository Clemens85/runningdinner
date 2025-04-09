package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.TeamNeighbourClusterListTO;

public record DinnerRouteOptimizationResult(String id, 
																						List<DinnerRouteTO> optimizedDinnerRoutes, 
																						AllDinnerRoutesWithDistancesListTO optimizedDistances,
																						TeamNeighbourClusterListTO optimizedTeamDistanceClusters) {

}
