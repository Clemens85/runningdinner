package org.runningdinner.dinnerroute.optimization;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;

public record DinnerRouteOptimizationResult(String id, 
																						DinnerRouteListTO optimizedDinnerRouteList,
																						AllDinnerRoutesWithDistancesListTO optimizedDistances,
																						TeamNeighbourClusterListTO optimizedTeamNeighbourClusters) {

}
