package org.runningdinner.dinnerroute.neighbours;

import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceEntry;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.TeamTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeamNeighbourClusterCalculationService {
	
	 private final TeamService teamService;

	 public TeamNeighbourClusterCalculationService(TeamService teamService) {
		 this.teamService = teamService;
	 }

	 public List<TeamNeighbourCluster> calculateTeamNeighbourClusters(@ValidateAdminId String adminId, double rangeInMeters) {
		 List<Team> teams = teamService.findTeamArrangements(adminId, false);
		 DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(teams, rangeInMeters);
	   return mapToTeamNeighbourClusters(distanceMatrix, teams); 
	 }
	 
	 public List<TeamNeighbourCluster> calculateTeamNeighbourClusters(List<Team> teams, double rangeInMeters) {
		 DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(teams, rangeInMeters);
	   return mapToTeamNeighbourClusters(distanceMatrix, teams); 
	 }

	 private static List<TeamNeighbourCluster> mapToTeamNeighbourClusters(DistanceMatrix distanceMatrix, List<Team> teams) {
		 List<TeamNeighbourCluster> result = new ArrayList<>();
		 for (var entry : distanceMatrix.getEntries().entrySet()) {
			 DistanceEntry distanceEntry = entry.getKey();
			 Double distance = entry.getValue();
			 List<TeamTO> resultingTeams = distanceEntry.mapSrcAndDestToTeamTOs(teams);
			 resultingTeams.sort((a, b) -> Integer.compare(a.getTeamNumber(), b.getTeamNumber()));
			 result.add(new TeamNeighbourCluster(resultingTeams.get(0), resultingTeams.get(1), distance));
		 }
		 result.sort((a, b) -> Double.compare(b.distance(), a.distance()));
		 return result;
	 }

 }
