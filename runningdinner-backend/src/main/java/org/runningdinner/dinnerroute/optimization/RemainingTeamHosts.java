package org.runningdinner.dinnerroute.optimization;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.runningdinner.core.MealClass;

public class RemainingTeamHosts {

	private static final int INDEX_BASE = 1;
	
	private TeamHostLocationList teamHostLocationList;
	
	private TreeMap<Integer, Integer> numClustersByClusterSize;

	private int totalNumberOfClustersToItereate;
	
	private Map<Integer, Integer> numTeamsToFillUpPerCluster = new HashMap<>();

	private List<TeamHostLocation> cancelledTeams = new ArrayList<>();
	
	private List<TeamHostLocation> teamsWithMissingGeocode = new ArrayList<>();
	
	private int currentClusterNumber = 0;
	
	public RemainingTeamHosts(TeamHostLocationList teamHostLocationList, TreeMap<Integer, Integer> numClustersByClusterSize) {
		this.teamHostLocationList = teamHostLocationList;
		this.numClustersByClusterSize = numClustersByClusterSize;
		this.totalNumberOfClustersToItereate = calculateTotalNumberOfClustersToItereate();
		this.init();
	}
	
	public RemainingTeamHosts(RemainingTeamHosts src) {
		this.teamHostLocationList = src.teamHostLocationList;
		this.numClustersByClusterSize = new TreeMap<>(src.numClustersByClusterSize);
		this.numTeamsToFillUpPerCluster = new HashMap<>(src.numTeamsToFillUpPerCluster);
		this.cancelledTeams = new ArrayList<>(src.cancelledTeams);
		this.teamsWithMissingGeocode = new ArrayList<>(src.teamsWithMissingGeocode);
		this.currentClusterNumber = src.currentClusterNumber;
	}
	
	private int calculateTotalNumberOfClustersToItereate() {
		return numClustersByClusterSize.values().stream().mapToInt(Integer::intValue).sum();
	}
	
	private void init() {
		for (int i = INDEX_BASE; i <= totalNumberOfClustersToItereate; i++) {
			this.numTeamsToFillUpPerCluster.put(i, 0);
		}
		
		int clusterIndex = 0;
		for (TeamHostLocation cancelledTeam : teamHostLocationList.cancelledTeams()) {
			int clusterKey = (clusterIndex % totalNumberOfClustersToItereate) + INDEX_BASE; // we use 1-index base
			this.numTeamsToFillUpPerCluster.compute(clusterKey, (k, v) -> v + 1);
			cancelledTeams.add(cancelledTeam);
			clusterIndex++;
		}
		
		for (TeamHostLocation invalidTeamHostLocation : teamHostLocationList.teamHostLocationsMissingGeocodes()) {
			int clusterKey = (clusterIndex % totalNumberOfClustersToItereate) + INDEX_BASE; // we use 1-index base
			this.numTeamsToFillUpPerCluster.compute(clusterKey, (k, v) -> v + 1);
			teamsWithMissingGeocode.add(invalidTeamHostLocation);
			clusterIndex++;
		}
	}

	public int nextCluster() {
		return ++currentClusterNumber;
	}
	
	public List<TeamHostLocation> takeForFillingUp(Map<MealClass, Integer> mealDistributions) {
		
		List<TeamHostLocation> result = new ArrayList<>();
		
		Integer numTeamsToFillUpCurrentCluster = this.numTeamsToFillUpPerCluster.get(currentClusterNumber);
		for (int i = 0; i < numTeamsToFillUpCurrentCluster; i++) {
			if (i % 2 == 0 && cancelledTeams.size() > 0) {
				if (addTeamForFillingUpTeamCluster(mealDistributions, cancelledTeams, result)) {
					continue;
				}
			} else if (i % 2 == 1 && teamsWithMissingGeocode.size() > 0) {
				if (addTeamForFillingUpTeamCluster(mealDistributions, teamsWithMissingGeocode, result)) {
					continue;
				}
			} 
			if (cancelledTeams.size() > 0 && addTeamForFillingUpTeamCluster(mealDistributions, cancelledTeams, result)) {
				continue;
			}			
			if (teamsWithMissingGeocode.size() > 0 && addTeamForFillingUpTeamCluster(mealDistributions, teamsWithMissingGeocode, result)) {
				continue;
			}
		}
		
		return result;
	}
	
	public void swapTeamsInClusterWithTeamsToFillUp(List<TeamHostLocation> cluster) {
		Integer numTeamsToFillUpCurrentCluster = this.numTeamsToFillUpPerCluster.get(currentClusterNumber);
		for (int i = 0; i < numTeamsToFillUpCurrentCluster; i++) {
			if (i % 2 == 0 && cancelledTeams.size() > 0) {
				if (swapTeamInCluster(cluster, cancelledTeams)) {
					continue;
				}
			} else if (i % 2 == 1 && teamsWithMissingGeocode.size() > 0) {
				if (swapTeamInCluster(cluster, teamsWithMissingGeocode)) {
					continue;
				}
			}
			if (cancelledTeams.size() > 0 && swapTeamInCluster(cluster, cancelledTeams)) {
				continue;
			}			
			if (teamsWithMissingGeocode.size() > 0 && swapTeamInCluster(cluster, teamsWithMissingGeocode)) {
				continue;
			}
		}
	}
	
	private boolean addTeamForFillingUpTeamCluster(Map<MealClass, Integer> mealDistributions, 
																								 List<TeamHostLocation> cancelledTeamsOrTeamsWithMissingGeocode,
																								 List<TeamHostLocation> result) {
		TeamHostLocation teamHostLocation = cancelledTeamsOrTeamsWithMissingGeocode.getFirst();
		Integer numMealsLeftToTake = mealDistributions.getOrDefault(teamHostLocation.getMeal(), 0);
		if (numMealsLeftToTake > 0) {
			mealDistributions.put(teamHostLocation.getMeal(), numMealsLeftToTake - 1);
			cancelledTeamsOrTeamsWithMissingGeocode.removeFirst();
			result.add(teamHostLocation);
			this.numTeamsToFillUpPerCluster.compute(currentClusterNumber, (k, v) -> v - 1); 
			return true;
		}
		return false;
	}

	private boolean swapTeamInCluster(List<TeamHostLocation> cluster, List<TeamHostLocation> cancelledTeamsOrTeamsWithMissingGeocode) {
		TeamHostLocation invalidTeam = cancelledTeamsOrTeamsWithMissingGeocode.get(0);
		TeamHostLocation teamInClusterWithSameMeal = cluster.stream().filter(thl -> thl.getMeal().isSameId(invalidTeam.getMeal().getId())).findFirst().orElse(null);
		if (teamInClusterWithSameMeal != null) {
			cluster.remove(teamInClusterWithSameMeal);
			cluster.add(invalidTeam);
			cancelledTeamsOrTeamsWithMissingGeocode.removeFirst();
			this.numTeamsToFillUpPerCluster.compute(currentClusterNumber, (k, v) -> v - 1); 
			return true;
		}
		return false;
	}

	public List<TeamHostLocation> getAllRemainingTeamHostLocations() {
		List<TeamHostLocation> result = new ArrayList<>(this.cancelledTeams);
		result.addAll(this.teamsWithMissingGeocode);
		this.cancelledTeams = Collections.emptyList();
		this.teamsWithMissingGeocode = Collections.emptyList();
		this.numTeamsToFillUpPerCluster.put(currentClusterNumber, 0);
		return result;
	}

	
	
}
