package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

public class DinnerRouteListTO {

  private List<DinnerRouteTO> dinnerRoutes = new ArrayList<>();
  
  private Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = new HashMap<>();

  public DinnerRouteListTO(List<DinnerRouteTO> dinnerRoutes, Map<Integer, LinkedHashSet<Integer>> teamClusterMappings) {
    this.dinnerRoutes = dinnerRoutes;
    this.teamClusterMappings = teamClusterMappings;
  }

  public List<DinnerRouteTO> getDinnerRoutes() {
    return dinnerRoutes;
  }

	public Map<Integer, LinkedHashSet<Integer>> getTeamClusterMappings() {
		return teamClusterMappings;
	}

}
