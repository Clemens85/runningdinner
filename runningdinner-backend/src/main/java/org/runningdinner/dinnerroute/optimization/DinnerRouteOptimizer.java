package org.runningdinner.dinnerroute.optimization;

import java.util.ArrayList;
import java.util.Collection;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;

import smile.clustering.HierarchicalClustering;
import smile.clustering.linkage.CompleteLinkage;


// TODO 1) Currently we don't consider invalid geocodes in here!
// TODO 2) Currently we also don't consider cancelled teams in here!
// TODO 3) Check that we have not duplicated addresses (which might be very likely due to clustering) in take-method!

public class DinnerRouteOptimizer {

	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizer.class);
	
	private final RunningDinner runningDinner;

	public DinnerRouteOptimizer(RunningDinner runningDinner) {
		this.runningDinner = runningDinner;
	}

	public Map<Integer, List<List<TeamHostLocation>>> calculateOptimization(List<TeamHostLocation> teamHostLocations) {
		
		Map<Integer, List<List<TeamHostLocation>>> result = new HashMap<>();
		
		TeamCombinationInfo teamCombinationInfo = newTeamCombinationInfo(teamHostLocations);
		Map<Integer, List<TeamHostLocation>> labeledCluster = buildAgglomerativeCluster(teamHostLocations, teamCombinationInfo);
		
		printCluster(labeledCluster);
		
		Collection<List<TeamHostLocation>> teamClusters = labeledCluster.values();
		
		Map<Integer, Integer> teamSizeFactorizations = teamCombinationInfo.getTeamSizeFactorizations();
		for (var entry : teamSizeFactorizations.entrySet()) {
			Integer teamClusterSize = entry.getKey();
			Integer numTeamClustersOfSize = entry.getValue();
			for (int i = 0; i < numTeamClustersOfSize; i++) {
				List<TeamHostLocation> matchedTeamCluster = teamClusters
																											.stream()
																											.filter(teamCluster -> teamCluster.size() == teamClusterSize)
																											.findFirst()
																											.orElseThrow(() -> new IllegalStateException("No matching teamCluster found for size " + teamClusterSize));
				
				List<List<TeamHostLocation>> clustersBySize = result.computeIfAbsent(teamClusterSize, key -> new ArrayList<>());
				clustersBySize.add(matchedTeamCluster);
			}
		}
		
		return result;
	}

	private void printCluster(Map<Integer, List<TeamHostLocation>> clusterMap) {
    int clusterId = 1;
    for (List<TeamHostLocation> cluster : clusterMap.values()) {
      System.out.println("🔹 Cluster " + clusterId + ":");
      for (TeamHostLocation teamLocation : cluster) {
        System.out.println(teamLocation.getId() + " (" + teamLocation.getMeal().getLabel() +  ")");
      }
      clusterId++;
    }
	}

	/**
	 * Returns the clustered team host locations
	 * @param incomingTeamLocations
	 * @param teamCombinationInfo
	 * @return Clusters mapped by label number (starting with 1)
	 */
	private Map<Integer, List<TeamHostLocation>> buildAgglomerativeCluster(List<TeamHostLocation> incomingTeamLocations, TeamCombinationInfo teamCombinationInfo) {
		
		Map<Integer, List<TeamHostLocation>> result = new LinkedHashMap<>();
		
		TreeMap<Integer, Integer> numClustersByClusterSize = new TreeMap<>(teamCombinationInfo.getTeamSizeFactorizations());
		
		int labelCounter = 1;
		
		List<TeamHostLocation> teamLocations = new ArrayList<>(incomingTeamLocations);
		
		LOGGER.info("Build clusters for {} teams with following cluster-sizes and the number of each cluster-size to build: {}", teamLocations.size(), numClustersByClusterSize);
		
		for (var entry : numClustersByClusterSize.entrySet()) {
			final int clusterSize = entry.getKey();
			int numClustersToBuild = entry.getValue();
			
			for (int i = 0; i < numClustersToBuild; i++) {
				List<TeamHostLocation> builtCluster = buildCluster(teamLocations, clusterSize);
				result.put(labelCounter++, builtCluster);
				teamLocations.removeAll(builtCluster);
			}
		}
		
		return result;
			
	}
	
	/**
	 * 
	 * @param teamLocations All team host locations to consider for building the cluster
	 * @param clusterSize Can be something like 9, 12, 15 and specifies the size of the returned list (which is the cluster)
	 * @return The built cluster of team host locations
	 */
	private List<TeamHostLocation> buildCluster(List<TeamHostLocation> teamLocations, int clusterSize) {
		
		int maxPartitionSize = teamLocations.size() / clusterSize;
		if (teamLocations.size() % clusterSize > 0) {
			maxPartitionSize++;
		}
		
		LOGGER.info("Build single cluster with size {} for {} teams and with max partitions of {}", clusterSize, teamLocations.size(), maxPartitionSize);
		
		if (maxPartitionSize == 1) {
			// We cannot use clustering if we have anyway only one cluster to build (Smile library will throw an exception when doing so):
			LOGGER.info("Max partition size is 1, hence no clustering is performed, just return the sublist of the inccoming teams with {} items", clusterSize);
			return new ArrayList<>(teamLocations.subList(0, clusterSize));  
		}
	
		final LinkedHashSet<TeamHostLocation> result = new LinkedHashSet<>();
		final double[][] distanceMatrix = DinnerRouteOptimizationUtil.mapTeamLocationsToDistanceMatrix(teamLocations);
		final HierarchicalClustering cluster = HierarchicalClustering.fit(CompleteLinkage.of(distanceMatrix));
		
		Map<MealClass, Integer> mealDistributions = DinnerRouteOptimizationUtil.calculateMealsDistributionForClusterSize(runningDinner.getConfiguration().getMealClasses(), clusterSize);
		
		for (int numPartitions = maxPartitionSize; numPartitions > 1; numPartitions--) {
			int[] clusterLabels = cluster.partition(numPartitions);
			List<List<TeamHostLocation>> clusterList = mapLabelsOrderedAsc(clusterLabels, teamLocations);
			
			int remainingClusterSize = clusterSize - result.size();
			
			LOGGER.info("Iterate with {} partitions and try to get teams to fit into remaining cluster-size {}", numPartitions, remainingClusterSize);
			
			// Step 1: Get best cluster out of the built clusters (read-only)
			List<TeamHostLocation> maxTakenTeamLocationsOfCluster = null;
			int bestSingleClusterIndex = -1; 
			for (int i = 0; i < clusterList.size(); i++) {
				List<TeamHostLocation> singleCluster = clusterList.get(i);
				Map<MealClass, Integer> mealDistributionsCopy = new HashMap<>(mealDistributions);
				LOGGER.info("Got single cluster at index {} with {} teams...", i, singleCluster.size());
				if (singleCluster.size() >= remainingClusterSize) {
					// The built cluster is big enough to be considered if it meets also the mealClass (and other) constraints
					List<TeamHostLocation> locationsOfSingleClusterToTake = take(singleCluster, remainingClusterSize, mealDistributionsCopy);
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
			if (maxTakenTeamLocationsOfCluster.size() >= remainingClusterSize && bestSingleClusterIndex >= 0) {
				List<TeamHostLocation> bestSingleCluster = clusterList.get(bestSingleClusterIndex);
				LOGGER.info("We can use cluster at index {} with {} effective teams to use, which should fit completely in our remaining cluster size of {}.", 
										bestSingleClusterIndex, maxTakenTeamLocationsOfCluster.size(), remainingClusterSize);
				result.addAll(take(bestSingleCluster, remainingClusterSize, mealDistributions));
				Assert.state(result.size() == clusterSize, "Result-Size was " + result.size() + ", but expected to be equal to cluster size of " + clusterSize);
				return getValidatedCluster(result, mealDistributions);
			} else if (numPartitions > 2) {
				// We can still enlarge the clusters to build, hence we just try it in the next iteration with a larger cluster
				LOGGER.info("No built cluster fits completely into the remaining cluster size of {}. Try again in next iteration with bigger cluster", remainingClusterSize);
				continue;
			} 
			
			// When reaching here there is no iteration left and we didn't found an optimal cluster to fit completely, hence we just take the best cluster (if available)
			if (bestSingleClusterIndex >= 0) {
				LOGGER.info("No optimal cluster found in last iteration. Use cluster at index {} with {} effective teams.", bestSingleClusterIndex, maxTakenTeamLocationsOfCluster.size());
				List<TeamHostLocation> bestSingleCluster = clusterList.get(bestSingleClusterIndex);
				result.addAll(take(bestSingleCluster, remainingClusterSize, mealDistributions));
			}
		}
		
		int remainingClusterSize = clusterSize - result.size();
		LOGGER.warn("There are still {} teams left for reaching the desired cluster size of {}. We fill them just with arbitrary teams that were not used so far.", remainingClusterSize, clusterSize);
		addReaminingMissingTeamsToResult(teamLocations, remainingClusterSize, mealDistributions, result);
		return getValidatedCluster(result, mealDistributions);
	}
	
	/**
	 * 
	 * @param locationsOfCluster
	 * @param clusterSize
	 * @param mealDistributions
	 * @return Returns the effective list of team host locations that can be used for building the team-cluster (might have a size of incoming clusterSize in an optimal scenario)
	 */
	private List<TeamHostLocation> take(List<TeamHostLocation> locationsOfCluster, int clusterSize, Map<MealClass, Integer> mealDistributions) {
		 List<TeamHostLocation> result = new ArrayList<>();
		 for (TeamHostLocation locationOfCluster : locationsOfCluster) {
			 if (result.size() == clusterSize) {
				 break;
			 }
			 if (canTake(locationOfCluster, mealDistributions)) {
				 result.add(locationOfCluster);
			 }
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
	
	private static List<List<TeamHostLocation>> mapLabelsOrderedAsc(int[] labels, List<TeamHostLocation> teamLocations) {
		Map<Integer, List<TeamHostLocation>> mappedLabels = mapLabels(labels, teamLocations);
		
		List<List<TeamHostLocation>> result = new ArrayList<>();
		result.addAll(mappedLabels.values());
		result.sort((a, b) -> Integer.compare(a.size(), b.size()));
		return result;
	}
	
	private TeamCombinationInfo newTeamCombinationInfo(List<TeamHostLocation> teamHostLocations) {
		try {
			return TeamCombinationInfo.newInstance(runningDinner.getConfiguration(), teamHostLocations.size());
		} catch (NoPossibleRunningDinnerException e) {
			throw new IllegalStateException(e); 			
		}
	}

}


//public static void main(String[] args) {
//List<GeocodedAddressEntity> teamLocationList = new ArrayList<>();
//teamLocationList.add(newGeocodedAddressEntity("Team 1", 48.8566, 2.3522)); // Paris
//teamLocationList.add(newGeocodedAddressEntity("Team 2", 51.5074, -0.1278)); // London
//teamLocationList.add(newGeocodedAddressEntity("Team 3", 52.5200, 13.4050)); // Berlin
//teamLocationList.add(newGeocodedAddressEntity("Team 4", 40.7128, -74.0060)); // New York
//var result = mapTeamLocationsToDistanceMatrix(teamLocationList);
//printDistanceMatrix(result);
//}
//
//static GeocodedAddressEntity newGeocodedAddressEntity(String id, double lat, double lng) {
//GeocodedAddressEntity result = new GeocodedAddressEntity();
//result.setId(id);
//result.setLat(lat);
//result.setLng(lng);
//return result;
//}
//