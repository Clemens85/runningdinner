package org.runningdinner.dinnerroute.optimization.local;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationUtil;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocation;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationList;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationService;
import org.runningdinner.participant.TeamStatus;
import org.springframework.util.Assert;

public class LocalClusterOptimizer {
	
	private final DinnerRouteCalculator dinnerRouteCalculator;
	
	private final Map<Integer, LinkedHashSet<Integer>> teamClusterMappings;

	public LocalClusterOptimizer(DinnerRouteCalculator dinnerRouteCalculator, Map<Integer, LinkedHashSet<Integer>> teamClusterMappings) {
		this.dinnerRouteCalculator = dinnerRouteCalculator;
		this.teamClusterMappings = teamClusterMappings;
	}

	public LocalClusterOptimizationResult calculateLocalClusterOptimizations(TeamHostLocationList teamHostLocationList) {
		
		List<TeamHostLocation> resultingTeamHostLocations = new ArrayList<>();
		Map<Integer, List<TeamMemberChange>> neededTeamMemberChangeActions = new HashMap<>();
		
		for (Integer clusterNumber : teamClusterMappings.keySet()) {
			
			TeamHostLocationList teamHostLocationsOfCluster = getTeamHostLocationsOfCluster(clusterNumber, teamHostLocationList);
			
			TeamHostLocationList optimizedLocationsOfCluster = null;
			if (CollectionUtils.isEmpty(teamHostLocationsOfCluster.cancelledTeams())) {
				optimizedLocationsOfCluster = calculateSingleLocalClusterOptimization(teamHostLocationsOfCluster);
			}

			if (optimizedLocationsOfCluster == null) {
				resultingTeamHostLocations.addAll(teamHostLocationsOfCluster.getAllTeamHostLocations());
				continue;
			}
			
			// else:
			resultingTeamHostLocations.addAll(optimizedLocationsOfCluster.getAllTeamHostLocations());
			
			List<TeamMemberChange> teamMemberChangesInCluster = new ArrayList<>();
			List<TeamHostLocation> originalTeamHostLocations = teamHostLocationsOfCluster.getAllTeamHostLocations();
			for (var optimizedTeamHostLocation : optimizedLocationsOfCluster.getAllTeamHostLocations()) {
				TeamHostLocation originalTeamHostLocation = TeamHostLocationList.findByTeamNumber(originalTeamHostLocations, optimizedTeamHostLocation.getTeamNumber());
				if (originalTeamHostLocation.hasEqualHostLocationData(optimizedTeamHostLocation)) {
					continue;
				}
				var moveTeamMembersFromLocation = TeamHostLocation.findLocationWithEqualTeamMembers(originalTeamHostLocations, optimizedTeamHostLocation.getTeam().getTeamMembersOrdered()); 
				teamMemberChangesInCluster.add(new TeamMemberChange(originalTeamHostLocation.getTeam().getId(), moveTeamMembersFromLocation.getTeam().getId()));
			}
			if (!teamMemberChangesInCluster.isEmpty()) {
				neededTeamMemberChangeActions.put(clusterNumber, teamMemberChangesInCluster);
			}
		}
		
		resultingTeamHostLocations.sort((a, b) -> Integer.compare(a.getTeamNumber(), b.getTeamNumber()));
		return new LocalClusterOptimizationResult(TeamHostLocationService.newTeamHostLocationList(resultingTeamHostLocations), neededTeamMemberChangeActions);
	}
	
	private TeamHostLocationList calculateSingleLocalClusterOptimization(TeamHostLocationList teamHostLocationsOfCluster) {

		List<DinnerRouteTO> originalRoutesOfCluster = DinnerRouteOptimizationUtil.buildDinnerRoute(teamHostLocationsOfCluster, dinnerRouteCalculator);
		DistanceMatrix originalDistanceMatrix = DistanceCalculator.calculateDistanceMatrix(teamHostLocationsOfCluster.getAllDinnerRouteTeamHostLocations());
		var originalRoutesWithDistances = DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(originalRoutesOfCluster, originalDistanceMatrix);
		
		Map<UUID, List<TeamHostLocation>> locationsByMeal = teamHostLocationsOfCluster.getAllTeamHostLocations()
																													.stream()
																													.collect(Collectors.groupingBy(thl -> thl.getMeal().getId()));
		
		List<List<List<TeamHostLocation>>> allPermutations = new ArrayList<>();
		for (var entrySet : locationsByMeal.entrySet()) {
			List<List<TeamHostLocation>> permutationsByMeal = buildPermutations(entrySet.getValue());
			allPermutations.add(permutationsByMeal);
		}

		LocalClusterOptimizationStrategy minimizeStrategy = getOptimizationStrategy(originalRoutesWithDistances); 

		List<List<TeamHostLocation>> allPossibleClusterVariants = cartesianProduct(allPermutations);
		TeamHostLocationList bestClusterVariant = null;
		for (var clusterVariantHostLocations : allPossibleClusterVariants) {
			TeamHostLocationList clusterVariant = TeamHostLocationService.newTeamHostLocationList(clusterVariantHostLocations);
			List<DinnerRouteTO> routesOfClusterVariant = DinnerRouteOptimizationUtil.buildDinnerRoute(clusterVariant, dinnerRouteCalculator);
		  DistanceMatrix distanceMatrixOfClusterVariant = DistanceCalculator.calculateDistanceMatrix(clusterVariant.teamHostLocationsValid());
			var routesWithDistancesOfClusterVariant = DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(routesOfClusterVariant, distanceMatrixOfClusterVariant);
			if (minimizeStrategy.isNewMinimum(routesWithDistancesOfClusterVariant)) {
				bestClusterVariant = clusterVariant;
			}
		}
		return bestClusterVariant;
	}
	
	
	private LocalClusterOptimizationStrategy getOptimizationStrategy(AllDinnerRoutesWithDistancesListTO originalRoutesWithDistances) {
		return new LocalClusterOptimizationMinimizeSum().init(originalRoutesWithDistances);
//		return new LocalClusterOptimizationMinimizeMax().init(originalRoutesWithDistances);
	}

	public static List<List<TeamHostLocation>> cartesianProduct(List<List<List<TeamHostLocation>>> groups) {
		List<List<TeamHostLocation>> result = new ArrayList<>();
		cartesianProductRecursive(groups, 0, new ArrayList<>(), result);
		return result;
	}

	private static void cartesianProductRecursive(List<List<List<TeamHostLocation>>> groups, int depth, List<TeamHostLocation> current, List<List<TeamHostLocation>> result) {
		if (depth == groups.size()) {
			result.add(new ArrayList<>(current));
			return;
		}
		for (List<TeamHostLocation> option : groups.get(depth)) {
			current.addAll(option);
			cartesianProductRecursive(groups, depth + 1, current, result);
			// Reset state
			for (int i = 0; i < option.size(); i++) {
				current.remove(current.size() - 1);
			}
		}
	}
	

	private static void permuteByReorderingList(List<TeamHostLocation> teamLocationsOfMeal, int start, List<List<TeamHostLocation>> result) {
    if (start == teamLocationsOfMeal.size() - 1) {
      result.add(new ArrayList<>(teamLocationsOfMeal));
      return;
    }

		for (int i = start; i < teamLocationsOfMeal.size(); i++) {
			Collections.swap(teamLocationsOfMeal, i, start);
			permuteByReorderingList(teamLocationsOfMeal, start + 1, result);
			Collections.swap(teamLocationsOfMeal, i, start);
		}
	}

	static List<List<TeamHostLocation>> buildPermutations(List<TeamHostLocation> originalTeamLocationsOfMeal) {
		
		Assert.state(originalTeamLocationsOfMeal.size() <= 8, "Building permutations only allowed for n <= 8, but was " + originalTeamLocationsOfMeal.size());
		
		List<List<TeamHostLocation>> allPermutationsAsReorderedList = new ArrayList<>();
		permuteByReorderingList(new ArrayList<>(originalTeamLocationsOfMeal), 0, allPermutationsAsReorderedList);
		
		List<List<TeamHostLocation>> result = new ArrayList<>();
		for (var permutationsAsReorderedList : allPermutationsAsReorderedList) {
			List<TeamHostLocation> resultingPermutation = new ArrayList<>();
			for (int i = 0; i < permutationsAsReorderedList.size(); i++) {
				TeamHostLocation originalTeamHostLocation = originalTeamLocationsOfMeal.get(i);
				TeamHostLocation permutatedTeamHostLocation = permutationsAsReorderedList.get(i);
				if (Objects.equals(originalTeamHostLocation, permutatedTeamHostLocation) || permutatedTeamHostLocation.getTeam().getStatus() == TeamStatus.CANCELLED) {
					resultingPermutation.add(new TeamHostLocation(permutatedTeamHostLocation.getTeam(), permutatedTeamHostLocation));
				} else {
					resultingPermutation.add(originalTeamHostLocation.copyWithHostLocationDataFrom(permutatedTeamHostLocation));
				}
			}
			result.add(resultingPermutation);
		}
		
		return result;
	}
	
	private TeamHostLocationList getTeamHostLocationsOfCluster(int clusterNumber, TeamHostLocationList allTeamHostLocationList) {
		LinkedHashSet<Integer> teamNumbersOfCluster = teamClusterMappings.get(clusterNumber);
		List<TeamHostLocation> teamHostLocationsOfCluster = TeamHostLocationList.filterByTeamNumbers(allTeamHostLocationList.getAllTeamHostLocations(), teamNumbersOfCluster);
		return TeamHostLocationService.newTeamHostLocationList(teamHostLocationsOfCluster);
	}

}
