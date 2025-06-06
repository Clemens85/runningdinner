package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;

public class DinnerRouteListTO {

  private List<DinnerRouteTO> dinnerRoutes = new ArrayList<>();
  
  private Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = new HashMap<>();
  
  private TeamNeighbourClusterListTO teamNeighbourClustersSameAddress;

  public DinnerRouteListTO(List<DinnerRouteTO> dinnerRoutes, Map<Integer, LinkedHashSet<Integer>> teamClusterMappings, TeamNeighbourClusterListTO teamNeighbourClustersSameAddress) {
    this.dinnerRoutes = dinnerRoutes;
    this.teamClusterMappings = teamClusterMappings;
    this.teamNeighbourClustersSameAddress = teamNeighbourClustersSameAddress;
  }

  public List<DinnerRouteTO> getDinnerRoutes() {
    return dinnerRoutes;
  }

	public Map<Integer, LinkedHashSet<Integer>> getTeamClusterMappings() {
		return teamClusterMappings;
	}

	public TeamNeighbourClusterListTO getTeamNeighbourClustersSameAddress() {
		return teamNeighbourClustersSameAddress;
	}

	
}
