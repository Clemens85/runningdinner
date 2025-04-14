package org.runningdinner.dinnerroute.optimization;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.StaticTemplateDinnerPlanGenerator;
import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceEntry;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamAccessor;
import org.runningdinner.participant.TeamService;
import org.springframework.stereotype.Service;

import jakarta.validation.Valid;

@Service
public class DinnerRouteOptimizationService {
	
  private final RunningDinnerService runningDinnerService;
  
  private final TeamService teamService;

	private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

	public DinnerRouteOptimizationService(RunningDinnerService runningDinnerService, TeamService teamService, DinnerRouteMessageFormatter dinnerRouteMessageFormatter) {
		this.runningDinnerService = runningDinnerService;
		this.teamService = teamService;
		this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
	}

	public DinnerRouteOptimizationResult calculateOptimization(String adminId, 
																														@Valid GeocodedAddressEntityListTO addressEntityList) throws NoPossibleRunningDinnerException {
    
		String optimizationId = UUID.randomUUID().toString().split("-")[0];
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<TeamHostLocation> teamHostLocations = maptoTeamHostLocations(adminId, addressEntityList);
    
    // Step 1: Get optimized team clusters and re-generate dinner route plans (this happens all in-memory, we use detached Teams):
    DinnerRouteOptimizer optimizer = new DinnerRouteOptimizer(runningDinner);
  	Map<Integer, List<List<TeamHostLocation>>> optimizedTeamSegments = optimizer.calculateOptimization(teamHostLocations);
  	
  	for (var entry : optimizedTeamSegments.entrySet()) {
  		List<List<TeamHostLocation>> teamClustersByClusterSize = entry.getValue();
  		for (List<TeamHostLocation> teamCluster : teamClustersByClusterSize) {
  			List<Team> wrappedTeams = TeamHostLocation.mapToTeams(teamCluster);
  			DinnerRouteOptimizationUtil.addMissingGeocodesToTeams(wrappedTeams, teamHostLocations);
				StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(wrappedTeams, runningDinner.getConfiguration());
  		}
  	}
  	
  	// Step 2: The wrapped teams in the teamHostLocation list contains now the re-generated dinner plans => convert them to DinnerRouteTO list:
  	List<DinnerRouteTO> optimizedDinnerRoutes = new ArrayList<>();
  	DinnerRouteCalculator dinnerRouteCalculator = new DinnerRouteCalculator(runningDinner, dinnerRouteMessageFormatter);
  	for (TeamHostLocation teamHostLocation : teamHostLocations) {
    	DinnerRouteTO dinnerRoute = dinnerRouteCalculator.buildDinnerRoute(teamHostLocation.getTeam());
    	optimizedDinnerRoutes.add(dinnerRoute);
  	}
  	
  	// Step 3a): Re-calculate distances of all dinner routes
    DistanceMatrix newDistanceMatrix = DistanceCalculator.calculateDistanceMatrix(teamHostLocations);
    AllDinnerRoutesWithDistancesListTO optimizedDinnerRoutesWithDistances = DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(optimizedDinnerRoutes, newDistanceMatrix);

    // Step 3b): Re-calculate cluster with teams that are located on same address:
    DistanceMatrix newDistanceMatrixDuplicatedAddresses = DistanceCalculator.calculateDistanceMatrix(teamHostLocations, 0);
    Set<DistanceEntry> duplicatedDistanceEntries = newDistanceMatrixDuplicatedAddresses.getEntries().keySet();
    Set<Integer> duplicatedTeamNumbers = new HashSet<>();
		duplicatedDistanceEntries.stream().forEach(entry -> duplicatedTeamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.srcId())));
		duplicatedDistanceEntries.stream().forEach(entry -> duplicatedTeamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.destId())));
    
    List<Team> neighbourTeams = TeamHostLocation.mapToTeams(teamHostLocations)
    																						.stream()
    																						.filter(t -> duplicatedTeamNumbers.contains(t.getTeamNumber()))
    																						.toList();
    List<TeamNeighbourCluster> teamNeighbourClusters = DinnerRouteService.mapToTeamNeighbourClusters(newDistanceMatrixDuplicatedAddresses, neighbourTeams);
    
    Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = DinnerRouteCalculator.reverseCalculateClustersOfTeams(optimizedDinnerRoutes);
    DinnerRouteListTO optimizedDinnerRouteList = new DinnerRouteListTO(optimizedDinnerRoutes, teamClusterMappings);
    
    return new DinnerRouteOptimizationResult(optimizationId, optimizedDinnerRouteList, optimizedDinnerRoutesWithDistances, new TeamNeighbourClusterListTO(teamNeighbourClusters));
	}

	private List<TeamHostLocation> maptoTeamHostLocations(String adminId, GeocodedAddressEntityListTO addressEntityList) {
    List<Team> teamArrangements = teamService.findTeamArrangements(adminId, false);
    
    return addressEntityList
          	.getAddressEntities()
          	.stream()
          	.map(addressEntity -> {
          		Team foundTeam = DinnerRouteCalculator.findTeamForTeamNumber(addressEntity.getId(), teamArrangements);
          		Team teamClone = foundTeam.createDetachedClone(false);
          		preserveDatabaseIds(teamClone, foundTeam);
          		return new TeamHostLocation(teamClone, addressEntity);
          	})
          	.toList();
	}
	
	 // We need IDs (as teams would be in database) later on for dinner route building
	private static void preserveDatabaseIds(Team detachedTeamClone, Team originalTeam) {
		List<Participant> originalParticipants = originalTeam.getTeamMembersOrdered();
		TeamAccessor.newAccessor(detachedTeamClone)
			.setId(originalTeam.getId())
			.setMealClassId(originalTeam.getMealClass().getId())
			.setTeamMemberIds(originalParticipants);
	}

}
