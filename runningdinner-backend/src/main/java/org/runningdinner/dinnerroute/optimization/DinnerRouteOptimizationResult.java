package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.TeamNeighbourClusterListTO;

public record DinnerRouteOptimizationResult(String id, 
																						DinnerRouteListTO optimizedDinnerRouteList,
																						List<TeamMemberChange> teamMemberChangesToPerform,
																						AllDinnerRoutesWithDistancesListTO optimizedDistances,
																						TeamNeighbourClusterListTO optimizedTeamDistanceClusters) {

}
