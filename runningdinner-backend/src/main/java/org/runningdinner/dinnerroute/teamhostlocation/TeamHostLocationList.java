package org.runningdinner.dinnerroute.teamhostlocation;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.util.Assert;

public record TeamHostLocationList(List<TeamHostLocation> teamHostLocationsValid, List<TeamHostLocation> teamHostLocationsMissingGeocodes, List<TeamHostLocation> cancelledTeams) {

	public int getNeededTeamsSize() {
		return teamHostLocationsValid.size() + teamHostLocationsMissingGeocodes.size() + cancelledTeams.size();
	}
	
	public List<TeamHostLocation> getAllTeamHostLocations() {
		List<TeamHostLocation> result = new ArrayList<TeamHostLocation>(getAllDinnerRouteTeamHostLocations());
		result.addAll(cancelledTeams);
		return result;
	}
	

	public List<TeamHostLocation> getAllDinnerRouteTeamHostLocations() {
		List<TeamHostLocation> result = new ArrayList<TeamHostLocation>(teamHostLocationsValid);
		result.addAll(teamHostLocationsMissingGeocodes);
		return result;
	}
	
	public static List<TeamHostLocation> filterByTeamNumbers(List<TeamHostLocation> teamHostLocations, Collection<Integer> teamNumbersToFilterFor) {
		return teamHostLocations
						.stream()
						.filter(thl -> teamNumbersToFilterFor.contains(thl.getTeamNumber()))
						.toList();
	}
	
	
	public static TeamHostLocation findByTeamNumber(List<TeamHostLocation> teamHostLocations, Integer teamNumberToFilterFor) {
		List<TeamHostLocation> result = filterByTeamNumbers(teamHostLocations, List.of(teamNumberToFilterFor));
		Assert.state(result.size() == 1, "Expected to find teamHostLocation with teamNr " + teamNumberToFilterFor + " but found " + result);
		return result.getFirst();
	}
}
