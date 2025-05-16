package org.runningdinner.dinnerroute.optimization;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.TeamCombinationInfo;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocation;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;

import smile.clustering.HierarchicalClustering;
import smile.clustering.linkage.CompleteLinkage;


// TODO Check that we have not duplicated addresses (which might be very likely due to clustering) in take-method!

public class GlobalClusterOptimizer {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalClusterOptimizer.class);
	
	private final RunningDinner runningDinner;

	public GlobalClusterOptimizer(RunningDinner runningDinner) {
		this.runningDinner = runningDinner;
	}

	public Map<Integer, List<List<TeamHostLocation>>> calculateOptimizedClusters(TeamHostLocationList teamHostLocationList) {
		
		Map<Integer, List<List<TeamHostLocation>>> result = new HashMap<>();
		
		TeamCombinationInfo teamCombinationInfo = newTeamCombinationInfo(teamHostLocationList);
		Map<Integer, List<TeamHostLocation>> labeledCluster = buildAgglomerativeCluster(teamHostLocationList, teamCombinationInfo);
		
		printCluster(labeledCluster);
		
		List<List<TeamHostLocation>> teamClusters = new ArrayList<>(labeledCluster.values());
		
		Map<Integer, Integer> teamSizeFactorizations = teamCombinationInfo.getTeamSizeFactorizations();
		for (var entry : teamSizeFactorizations.entrySet()) {
			Integer teamClusterSize = entry.getKey();
			Integer numTeamClustersOfSize = entry.getValue();
			for (int i = 0; i < numTeamClustersOfSize; i++) {
				List<TeamHostLocation> matchedTeamCluster = getAndRemoveMatchingTeamCluster(teamClusters, teamClusterSize);
				List<List<TeamHostLocation>> clustersBySize = result.computeIfAbsent(teamClusterSize, key -> new ArrayList<>());
				clustersBySize.add(matchedTeamCluster);
			}
		}
		
		return result;
	}

	private List<TeamHostLocation> getAndRemoveMatchingTeamCluster(List<List<TeamHostLocation>> teamClusters, Integer teamClusterSize) {
		int resultIndex = 0;
		List<TeamHostLocation> result = null;
		for (var teamCluster : teamClusters) {
			if (teamCluster.size() == teamClusterSize) {
				result = teamCluster;
				break;
			}
			resultIndex++;
		}
		Assert.notNull(result, "No matching teamCluster found for size " + teamClusterSize);
		teamClusters.remove(resultIndex);
		return result;
	}

	private void printCluster(Map<Integer, List<TeamHostLocation>> clusterMap) {
		StringBuilder output = new StringBuilder();
		
    int clusterId = 1;
    for (List<TeamHostLocation> cluster : clusterMap.values()) {
      LOGGER.info("*** CLUSTER {} ***: ", clusterId);
      for (TeamHostLocation teamLocation : cluster) {
      	output.append(teamLocation.getId() + " (" + teamLocation.getMeal().getLabel() +  ")").append("\r\n");
      }    
      LOGGER.info(output.toString());
      clusterId++;
    }

	}

	/**
	 * Returns the clustered team host locations
	 * @param incomingTeamLocations
	 * @param teamCombinationInfo
	 * @return Clusters mapped by label number (starting with 1)
	 */
	private Map<Integer, List<TeamHostLocation>> buildAgglomerativeCluster(TeamHostLocationList teamHostLocationList, TeamCombinationInfo teamCombinationInfo) {
		
		Map<Integer, List<TeamHostLocation>> result = new LinkedHashMap<>();
		
		TreeMap<Integer, Integer> numClustersByClusterSize = new TreeMap<>(teamCombinationInfo.getTeamSizeFactorizations());
		
		int labelCounter = 1;
		
		List<TeamHostLocation> teamLocationsValid = new ArrayList<>(teamHostLocationList.teamHostLocationsValid());
		
		LOGGER.info("Build clusters for {} valid teams with following cluster-sizes and the number of each cluster-size to build: {}", teamLocationsValid.size(), numClustersByClusterSize);
		
		RemainingTeamHosts remainingTeamHosts = new RemainingTeamHosts(teamHostLocationList, numClustersByClusterSize);
		
		for (var entry : numClustersByClusterSize.entrySet()) {
			final int clusterSize = entry.getKey();
			int numClustersToBuild = entry.getValue();
			
			for (int i = 0; i < numClustersToBuild; i++) {
				remainingTeamHosts.nextCluster();
				List<TeamHostLocation> builtCluster = buildCluster(teamLocationsValid, clusterSize, remainingTeamHosts);
				result.put(labelCounter++, builtCluster);
				teamLocationsValid.removeAll(builtCluster);
			}
		}
		
		return result;
			
	}
	
	/**
	 * Build one single cluster with size of clusterSize considering all passed teamHostLocations
	 * @param teamLocations All team host locations to consider for building the cluster
	 * @param clusterSize Can be something like 9, 12, 15 and specifies the size of the returned list (which is the cluster)
	 * @param remainingTeamHosts Holds the needed info about team-hosts that cannot directly be used for clustering (cancelled teams and teams without geocodes), 
	 * 												   but which also need to be included in the final clusters
	 * @return The built cluster of team host locations
	 */
	private List<TeamHostLocation> buildCluster(List<TeamHostLocation> teamLocations, int clusterSize, RemainingTeamHosts remainingTeamHosts) {
		
		int maxPartitionSize = teamLocations.size() / clusterSize;
		if (teamLocations.size() % clusterSize > 0) {
			maxPartitionSize++;
		}
		
		LOGGER.info("Build single cluster with size {} for {} teams and with max partitions of {}", clusterSize, teamLocations.size(), maxPartitionSize);
		
		// We cannot use clustering if we have anyway only one cluster to build (Smile library will throw an exception when doing so):
		if (maxPartitionSize == 1) {
			return buildLastClusterWithoutPartitioning(teamLocations, clusterSize, remainingTeamHosts);
		}
	
		final LinkedHashSet<TeamHostLocation> result = new LinkedHashSet<>();
		final double[][] distanceMatrix = DinnerRouteOptimizationUtil.mapTeamLocationsToDistanceMatrix(teamLocations);
		final HierarchicalClustering cluster = HierarchicalClustering.fit(CompleteLinkage.of(distanceMatrix));
		
		Map<MealClass, Integer> mealDistributions = DinnerRouteOptimizationUtil.calculateMealsDistributionForClusterSize(runningDinner.getConfiguration().getMealClasses(), clusterSize);
		
		for (int numPartitions = maxPartitionSize; numPartitions > 1; numPartitions--) {
			int[] clusterLabels = cluster.partition(numPartitions);
			List<List<TeamHostLocation>> clusterList = mapLabelsOrderedbySizeAsc(clusterLabels, teamLocations);
			
			int remainingClusterSize = clusterSize - result.size();
			
			LOGGER.info("Iterate with {} partitions and try to get teams to fit into remaining cluster-size {}", numPartitions, remainingClusterSize);
			
			// Step 1: Get best cluster out of the built clusters (read-only)
			List<TeamHostLocation> maxTakenTeamLocationsOfCluster = null;
			int bestSingleClusterIndex = -1; 
			for (int i = 0; i < clusterList.size(); i++) {
				List<TeamHostLocation> singleCluster = clusterList.get(i);
				LOGGER.info("Got single cluster at index {} with {} teams...", i, singleCluster.size());
				if (singleCluster.size() >= remainingClusterSize) {
					// The built cluster is big enough to be considered if it meets also the mealClass (and other) constraints
					List<TeamHostLocation> locationsOfSingleClusterToTake = take(singleCluster, remainingClusterSize, mealDistributions, remainingTeamHosts, true);
					LOGGER.info("We could effectively use {} teams from single cluster for building the resulting cluster...", locationsOfSingleClusterToTake.size());
					if (maxTakenTeamLocationsOfCluster == null || maxTakenTeamLocationsOfCluster.size() < locationsOfSingleClusterToTake.size()) {
						maxTakenTeamLocationsOfCluster = locationsOfSingleClusterToTake;
						bestSingleClusterIndex = i;
					}
				} else {
					LOGGER.info("Single cluster at index {} with {} teams is too small (at least {} teams needed)", i, singleCluster.size(), remainingClusterSize);
				}
			}
			
			
			// Step 2: Use the determined cluster if it fits completely to build the final cluster result 
			if (maxTakenTeamLocationsOfCluster != null && maxTakenTeamLocationsOfCluster.size() >= remainingClusterSize && bestSingleClusterIndex >= 0) {
				List<TeamHostLocation> bestSingleCluster = clusterList.get(bestSingleClusterIndex);
				LOGGER.info("We can use cluster at index {} with {} effective teams to use, which should fit completely in our remaining cluster size of {}.", 
										bestSingleClusterIndex, maxTakenTeamLocationsOfCluster.size(), remainingClusterSize);
				
				result.addAll(take(bestSingleCluster, remainingClusterSize, mealDistributions, remainingTeamHosts, false));
				
				Assert.state(result.size() == clusterSize, "Result-Size was " + result.size() + ", but expected to be equal to cluster size of " + clusterSize);
				return getValidatedCluster(result, mealDistributions);
			}
			else if (numPartitions > 2) {
				// We can still enlarge the clusters to build, hence we just try it in the next iteration with a larger cluster
				LOGGER.info("No built cluster fits completely into the remaining cluster size of {}. Try again in next iteration with bigger cluster", remainingClusterSize);
				continue;
			} 
			
			// When reaching here there is no iteration left and we didn't found an optimal cluster to fit completely, hence we just take the best cluster (if available)
			if (bestSingleClusterIndex >= 0) {
				LOGGER.info("No optimal cluster found in last iteration. Use cluster at index {} with {} effective teams.", bestSingleClusterIndex, maxTakenTeamLocationsOfCluster.size());
				List<TeamHostLocation> bestSingleCluster = clusterList.get(bestSingleClusterIndex);
				result.addAll(take(bestSingleCluster, remainingClusterSize, mealDistributions, remainingTeamHosts, false));
			}
		}
		
		int remainingClusterSize = clusterSize - result.size();
		LOGGER.warn("There are still {} teams left for reaching the desired cluster size of {}. We fill them just with arbitrary teams that were not used so far.", remainingClusterSize, clusterSize);
		addReaminingMissingTeamsToResult(teamLocations, remainingClusterSize, mealDistributions, remainingTeamHosts, result);
		return getValidatedCluster(result, mealDistributions);
	}
	
	private List<TeamHostLocation> buildLastClusterWithoutPartitioning(List<TeamHostLocation> teamLocations, int clusterSize, RemainingTeamHosts remainingTeamHosts) {
		LOGGER.info("Max partition size is 1, hence no clustering is performed, just return the sublist of the inccoming teams with {} items", clusterSize);
		ArrayList<TeamHostLocation> result = new ArrayList<>(teamLocations.subList(0, Math.min(clusterSize, teamLocations.size())));
		if (result.size() == clusterSize) {
			return result;
		}
		if (result.size() < clusterSize) {
			result.addAll(remainingTeamHosts.getAllRemainingTeamHostLocations());
		}
		Assert.state(result.size() == clusterSize, "Expected result to have " + clusterSize + " entries, but had only " + result.size());
		return result;
	}
	
	/**
	 * 
	 * @param locationsOfCluster
	 * @param clusterSize
	 * @param mealDistributions
	 * @return Returns the effective list of team host locations that can be used for building the team-cluster (might have a size of incoming clusterSize in an optimal scenario)
	 */
	private List<TeamHostLocation> take(List<TeamHostLocation> locationsOfCluster, 
																		  int clusterSize, 
																		  Map<MealClass, Integer> mealDistributions, 
																		  RemainingTeamHosts remainingTeamHosts, 
																		  boolean dryRun) {
		
		Map<MealClass, Integer> mealDistributionsToUse = dryRun ? new HashMap<>(mealDistributions) : mealDistributions;
		RemainingTeamHosts remainingTeamHostsToUse = dryRun ? new RemainingTeamHosts(remainingTeamHosts) : remainingTeamHosts;
		
		 List<TeamHostLocation> result = new ArrayList<>();
		 for (TeamHostLocation locationOfCluster : locationsOfCluster) {
			 if (result.size() == clusterSize) {
				 break;
			 }
			 if (canTake(locationOfCluster, mealDistributionsToUse)) {
				 result.add(locationOfCluster);
			 }
		 }
		 
		 if (result.size() >= clusterSize) {
			 remainingTeamHostsToUse.swapTeamsInClusterWithTeamsToFillUp(result);
		 } else {
			 List<TeamHostLocation> teaHostLocationsForFillingUp = remainingTeamHostsToUse.takeForFillingUp(mealDistributionsToUse);
			 result.addAll(teaHostLocationsForFillingUp);
		 }
		
		 return result;
	}

	/**
	 * Check if the meal of the provided teamHostLocation is fitting the current requirements and can be used within the team-cluster to build.<br/>
	 * This method will modify the passed mealDistributions and decrement the number of remaining mealClasses
	 *
	 * @param teamHostLocation
	 * @param mealDistributions All remaining mealClass distributions left
	 * @return
	 */
	private boolean canTake(TeamHostLocation teamHostLocation, Map<MealClass, Integer> mealDistributions) {
		Integer numMealsLeftToTake = mealDistributions.getOrDefault(teamHostLocation.getMeal(), 0);
		if (numMealsLeftToTake > 0) {
			mealDistributions.put(teamHostLocation.getMeal(), numMealsLeftToTake - 1);
			return true;
		}
		return false;
	}
	
	private void addReaminingMissingTeamsToResult(List<TeamHostLocation> teamHostLocations,
																							 int incomingRemainingClusterSize, 
																							 Map<MealClass, Integer> mealDistributions, 
																							 RemainingTeamHosts remainingTeamHosts,
																							 LinkedHashSet<TeamHostLocation> result) {
		
		int remainingClusterSize = incomingRemainingClusterSize;
		
		for (TeamHostLocation teamHostLocation : teamHostLocations) {
			if (remainingClusterSize <= 0) {
				break;
			}
			if (result.contains(teamHostLocation)) {
				continue;
			}
			if (canTake(teamHostLocation, mealDistributions)) {
				result.add(teamHostLocation);
				remainingClusterSize--;
			}
		}
		
		if (remainingClusterSize > 0) {
			List<TeamHostLocation> cancelledOrInvalidTeamsToFillup = remainingTeamHosts.takeForFillingUp(mealDistributions);
			Assert.state(cancelledOrInvalidTeamsToFillup.size() <= remainingClusterSize, "Took to much reamaining cancelled / invalid teams (Size: " + cancelledOrInvalidTeamsToFillup.size() + ")" + 
																																									" from " + remainingTeamHosts + ". (Needed size was:" + remainingClusterSize + ")");
			result.addAll(cancelledOrInvalidTeamsToFillup);
			remainingClusterSize -= cancelledOrInvalidTeamsToFillup.size();
		}

		Assert.state(remainingClusterSize <= 0, "There are still " + remainingClusterSize + " teams left for building the final cluster. " +
																		        "Current cluster-size is " + result.size() + ", but we exhaused all available teams!");
	}
	
	private List<TeamHostLocation> getValidatedCluster(LinkedHashSet<TeamHostLocation> result, Map<MealClass, Integer> mealDistributions) {
		for (var entry : mealDistributions.entrySet()) {
			Assert.state(entry.getValue() <= 0, "Number for meal " + entry.getKey() + " should be <= 0, but was " + entry.getValue());
		}
		return new ArrayList<>(result);
	}
	

	private static Map<Integer, List<TeamHostLocation>> mapLabels(int[] labels, List<TeamHostLocation> teamLocations) {
    Map<Integer, List<TeamHostLocation>> clusterMap = new HashMap<>();
    for (int i = 0; i < labels.length; i++) {
      clusterMap.computeIfAbsent(labels[i], k -> new ArrayList<>()).add(teamLocations.get(i));
    }
    return clusterMap;
	}
	
	private static List<List<TeamHostLocation>> mapLabelsOrderedbySizeAsc(int[] labels, List<TeamHostLocation> teamLocations) {
		Map<Integer, List<TeamHostLocation>> mappedLabels = mapLabels(labels, teamLocations);
		
		List<List<TeamHostLocation>> result = new ArrayList<>();
		result.addAll(mappedLabels.values());
		result.sort((a, b) -> Integer.compare(a.size(), b.size()));
		return result;
	}
	
	private TeamCombinationInfo newTeamCombinationInfo(TeamHostLocationList teamHostLocationList) {
		try {
			return TeamCombinationInfo.newInstance(runningDinner.getConfiguration(), teamHostLocationList.getNeededTeamsSize());
		} catch (NoPossibleRunningDinnerException e) {
			throw new IllegalStateException(e); 			
		}
	}
	
}
