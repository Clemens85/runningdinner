package org.runningdinner.dinnerroute.optimization.local;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationList;

public record LocalClusterOptimizationResult(TeamHostLocationList resultingTeamHostLocations, Map<Integer, List<TeamMemberChange>> teamMemberChangeActions) {
	
	public boolean hasOptimizations() {
		return teamMemberChangeActions != null && !teamMemberChangeActions.isEmpty();
	}
	
	public List<TeamMemberChange> getAllTeamMemberChanges() {
		if (!hasOptimizations()) {
			return Collections.emptyList();
		}
		return new ArrayList<>(teamMemberChangeActions.values().stream().flatMap(List::stream).toList());
	}
}
