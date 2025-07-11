package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.optimization.local.TeamMemberChange;

public record DinnerRouteOptimizationResult(String id, 
																						DinnerRouteListTO optimizedDinnerRouteList,
																						List<TeamMemberChange> teamMemberChangesToPerform,
																						AllDinnerRoutesWithDistancesListTO optimizedDistances,
																						TeamNeighbourClusterListTO optimizedTeamNeighbourClusters) {

}
