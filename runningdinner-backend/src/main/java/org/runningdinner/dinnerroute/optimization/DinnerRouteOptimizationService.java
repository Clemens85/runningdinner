package org.runningdinner.dinnerroute.optimization;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamCombinationInfo;
import org.runningdinner.core.dinnerplan.StaticTemplateDinnerPlanGenerator;
import org.runningdinner.core.util.NumberUtil;
import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.DinnerRouteTeamTO;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.optimization.local.LocalClusterOptimizer;
import org.runningdinner.dinnerroute.optimization.local.TeamMemberChange;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocation;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationList;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationService;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import jakarta.validation.Valid;

@Service
public class DinnerRouteOptimizationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizationService.class);
	
  private final RunningDinnerService runningDinnerService;
  
  private final TeamHostLocationService teamHostLocationService;

	private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

	private final TeamService teamService;

	private final TeamRepository teamRepository;

	private final DinnerRouteOptimizationFeedbackService dinnerRouteOptimizationFeedbackService;
	
  private final TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

	public DinnerRouteOptimizationService(RunningDinnerService runningDinnerService, 
																			  TeamHostLocationService teamHostLocationService, 
																			  TeamService teamService,
																			  TeamRepository teamRepository,
																			  DinnerRouteMessageFormatter dinnerRouteMessageFormatter,
																			  DinnerRouteOptimizationFeedbackService  dinnerRouteOptimizationFeedbackService, 
																			  TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService) {
		
		this.runningDinnerService = runningDinnerService;
		this.teamHostLocationService = teamHostLocationService;
		this.teamService = teamService;
		this.teamRepository = teamRepository;
		this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
		this.dinnerRouteOptimizationFeedbackService = dinnerRouteOptimizationFeedbackService;
		this.teamNeighbourClusterCalculationService = teamNeighbourClusterCalculationService;
	}

	@Transactional(readOnly = true)
	public DinnerRouteOptimizationResult calculateOptimization(String adminId, 
																														 @Valid CalculateDinnerRouteOptimizationRequest calculateRequest) throws NoPossibleRunningDinnerException {
    
		String optimizationId = UUID.randomUUID().toString().split("-")[0];
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    TeamHostLocationList teamHostLocationList = teamHostLocationService.findTeamHostLocations(adminId);
    
    // Step 1: Get optimized team clusters and re-generate dinner route plans (this happens all in-memory, we use detached Teams):
    GlobalClusterOptimizer globalOptimizer = new GlobalClusterOptimizer(runningDinner);
  	Map<Integer, List<List<TeamHostLocation>>> optimizedTeamSegments = globalOptimizer.calculateOptimizedClusters(teamHostLocationList);
  	
  	for (var entry : optimizedTeamSegments.entrySet()) {
  		List<List<TeamHostLocation>> teamClustersByClusterSize = entry.getValue();
  		for (List<TeamHostLocation> teamCluster : teamClustersByClusterSize) {
  			List<Team> wrappedTeams = TeamHostLocation.mapToTeams(teamCluster);
				StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(wrappedTeams, runningDinner.getConfiguration());
  		}
  	}
  	
  	// Step 2a: The wrapped teams in the teamHostLocation list contains now the re-generated dinner plans => convert them to DinnerRouteTO list:
  	DinnerRouteCalculator dinnerRouteCalculator = new DinnerRouteCalculator(runningDinner, dinnerRouteMessageFormatter);
  	List<DinnerRouteTO> optimizedDinnerRoutes = DinnerRouteOptimizationUtil.buildDinnerRoute(teamHostLocationList, dinnerRouteCalculator);
  	
    Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = DinnerRouteCalculator.reverseCalculateClustersOfTeams(optimizedDinnerRoutes);
    
    // Step 2b: Try to optimize routes on local clusters (by swapping team-members of same meal, if reasonable):
    var localClusterOptimizationResult = new LocalClusterOptimizer(dinnerRouteCalculator, teamClusterMappings)
    																						.calculateLocalClusterOptimizations(teamHostLocationList);
    
    if (localClusterOptimizationResult.hasOptimizations()) {
      // We might need to recalculate dinner-routes, due to there are new local optimizations:
      teamHostLocationList = localClusterOptimizationResult.resultingTeamHostLocations();
      optimizedDinnerRoutes = DinnerRouteOptimizationUtil.buildDinnerRoute(teamHostLocationList, dinnerRouteCalculator);
    }
  	
  	List<TeamHostLocation> teamHostLocationsValid = teamHostLocationList.teamHostLocationsValid();
  	
  	// Step 3a): Re-calculate distances of all dinner routes
//    DistanceMatrix newDistanceMatrix = DistanceCalculator.calculateDistanceMatrix(teamHostLocationsValid);
    AllDinnerRoutesWithDistancesListTO optimizedDinnerRoutesWithDistances = DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(optimizedDinnerRoutes);

    // Step 3b): Re-calculate cluster with teams that are located on same address:
    List<Team> allWrappedTeams = teamHostLocationsValid.stream().map(TeamHostLocation::getTeam).toList();
    List<TeamNeighbourCluster> teamNeighbourClusters = teamNeighbourClusterCalculationService.calculateTeamNeighbourClusters(adminId, allWrappedTeams, 0);
    
//    DistanceMatrix newDistanceMatrixDuplicatedAddresses = DistanceCalculator.calculateDistanceMatrix(teamHostLocationsValid, 0);
//    Set<DistanceEntry> duplicatedDistanceEntries = newDistanceMatrixDuplicatedAddresses.getEntries().keySet();
//    Set<Integer> duplicatedTeamNumbers = new HashSet<>();
//		duplicatedDistanceEntries.stream().forEach(entry -> duplicatedTeamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.srcId())));
//		duplicatedDistanceEntries.stream().forEach(entry -> duplicatedTeamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.destId())));
//    
//    List<Team> neighbourTeams = TeamHostLocation.mapToTeams(teamHostLocationsValid)
//    																						.stream()
//    																						.filter(t -> duplicatedTeamNumbers.contains(t.getTeamNumber()))
//    																						.toList();
//    List<TeamNeighbourCluster> teamNeighbourClusters = TeamNeighbourClusterCalculationService.mapToTeamNeighbourClusters(newDistanceMatrixDuplicatedAddresses, neighbourTeams, teamHostLocationList.getAllTeamHostLocations());
    
    DinnerRouteListTO optimizedDinnerRouteList = new DinnerRouteListTO(optimizedDinnerRoutes, teamClusterMappings, new TeamNeighbourClusterListTO(teamNeighbourClusters));
    
    var result = new DinnerRouteOptimizationResult(optimizationId, 
    																							 optimizedDinnerRouteList, 
    																							 localClusterOptimizationResult.getAllTeamMemberChanges(),
    																							 optimizedDinnerRoutesWithDistances,
    																							 new TeamNeighbourClusterListTO(teamNeighbourClusters));
    
    try {
    	dinnerRouteOptimizationFeedbackService.sendOptimizationFeedbackAsync(adminId, result, calculateRequest.currentSumDistanceInMeters(), calculateRequest.currentAverageDistanceInMeters());
    } catch (Exception e) {
    	LOGGER.error("Could not call sendOptimizationFeedbackAsync", e);
    }
    
    return result;
	}
	

	@Transactional
	public void saveNewDinnerRoutes(String adminId, @Valid SaveDinnerRouteOptimizationRequest saveRouteOptimizationsRequest) throws NoPossibleRunningDinnerException {

		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		
		List<Team> existingTeams = teamService.findTeamArrangements(adminId, false);
		existingTeams.forEach(Team::removeAllTeamReferences);

		performTeamMemberChanges(saveRouteOptimizationsRequest.teamMemberChangesToPerform(), existingTeams);

		List<DinnerRouteTO> dinnerRoutes = saveRouteOptimizationsRequest.optimizedDinnerRoutes();
		validateOptimizedRoutes(dinnerRoutes, runningDinner, existingTeams);
		
		for (DinnerRouteTO dinnerRoute : dinnerRoutes) {
			TeamTO currentTeamInRoute = dinnerRoute.getCurrentTeam();
			
			Team currentTeamToSave = findTeamForTeamNumber(String.valueOf(currentTeamInRoute.getTeamNumber()), existingTeams);
			
			List<DinnerRouteTeamTO> allTeamsOnRoute = dinnerRoute.getTeams();
			List<Team> hostingTeamsOnRoute = allTeamsOnRoute.stream()
																				.filter(hostingTeam -> hostingTeam.getTeamNumber() != currentTeamInRoute.getTeamNumber())
																				.map(hostingTeam -> findTeamForTeamNumber(String.valueOf(hostingTeam.getTeamNumber()), existingTeams))
																				.toList();
			
			for (Team hostingTeam : hostingTeamsOnRoute) {
				currentTeamToSave.addHostTeam(hostingTeam);
			}
		}
		
		teamRepository.saveAll(existingTeams);
	}
	
  private static Team findTeamForTeamNumber(String teamNumberStr, List<Team> teams) {
    int teamNumber = NumberUtil.parseIntSafe(teamNumberStr);
    return teams
            .stream()
            .filter(t -> t.getTeamNumber() == teamNumber)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find team with teamMember " + teamNumber + " within teams " + teams));
  }
	

	private void performTeamMemberChanges(List<TeamMemberChange> teamMemberChanges, List<Team> existingTeams) {
		if (CollectionUtils.isEmpty(teamMemberChanges)) {
			return;
		}

		checkTeamMemberChangesConsistency(teamMemberChanges);

		Map<UUID, Set<Participant>> teamMembersByTeamId = new HashMap<>();
		existingTeams.forEach(team -> {
			teamMembersByTeamId.put(team.getId(), team.getTeamMembers());
		});

		// Important: First remove all team members (in order to avoid side effects when also setting them)....
		for (TeamMemberChange teamMemberChange : teamMemberChanges) {
			Team currentTeam = IdentifierUtil.filterListForIdMandatory(existingTeams, teamMemberChange.currentTeamId());
			currentTeam.removeAllTeamMembers();
		}
		// ... Then set the new team members for each team
		for (TeamMemberChange teamMemberChange : teamMemberChanges) {
			Team currentTeam = IdentifierUtil.filterListForIdMandatory(existingTeams, teamMemberChange.currentTeamId());
			currentTeam.setTeamMembers(teamMembersByTeamId.get(teamMemberChange.moveTeamMembersFromTeamId()));
		}
	}

	static void checkTeamMemberChangesConsistency(List<TeamMemberChange> teamMemberChanges) {
		if (CollectionUtils.isEmpty(teamMemberChanges)) {
			return;
		}
		
		List<UUID> destTeamIds = teamMemberChanges.stream().map(change -> change.currentTeamId()).toList();
		List<UUID> srcTeamIds = teamMemberChanges.stream().map(change -> change.moveTeamMembersFromTeamId()).toList();
		
		Set<UUID> destTeamIdsAsSet = new HashSet<>(destTeamIds);
		Assert.isTrue(destTeamIdsAsSet.size() == destTeamIds.size(), "Expected moveTeamMembersFromTeamId to contain no duplicates, but did: " + destTeamIds);
		Set<UUID> srcTeamIdsAsSet = new HashSet<>(destTeamIds);
		Assert.isTrue(srcTeamIdsAsSet.size() == srcTeamIds.size(), "Expected currentTeamId to contain no duplicates, but did: " + srcTeamIds);
		
		Assert.isTrue(Objects.equals(srcTeamIdsAsSet, destTeamIdsAsSet), "Each team must be contained in both currentTeamId and moveTeamMembersFromTeamId, but was not: " + teamMemberChanges);
	}

	public void validateOptimizedRoutes(List<DinnerRouteTO> dinnerRoutes, RunningDinner runningdinner, List<Team> existingTeams) throws NoPossibleRunningDinnerException {

		List<Team> cancelledTeams = existingTeams.stream().filter(t -> t.getStatus() == TeamStatus.CANCELLED).toList();
		long numTeamsWithRoutes = existingTeams.size() - cancelledTeams.size();
		
		checkNumRoutes(dinnerRoutes, numTeamsWithRoutes);
		RunningDinnerConfig configuration = runningdinner.getConfiguration();

		int numMealClasses = configuration.getNumberOfMealClasses();
		int expectedOccurrencesOfEachMeal = existingTeams.size() / numMealClasses;
		
		Map<UUID, Long> expectedMealClassOccurrences = new HashMap<>();
		for (MealClass mealClass : configuration.getMealClasses()) {
			long numCancelledTeamsWithSameMeal = cancelledTeams.stream().filter(t -> t.getMealClass().isSameId(mealClass.getId())).count();
			expectedMealClassOccurrences.put(mealClass.getId(), expectedOccurrencesOfEachMeal - numCancelledTeamsWithSameMeal);
		}
		
		checkRoutesConsistency(dinnerRoutes, numMealClasses, expectedMealClassOccurrences);
	}
	
	protected static void checkNumRoutes(List<DinnerRouteTO> dinnerRoutes, long expectedNumRoutes) {
		int numRoutes = dinnerRoutes.size();
		Assert.state(numRoutes == expectedNumRoutes, "Expected " + expectedNumRoutes + " routes, but was " + numRoutes);
	}
	
	protected static void checkRoutesConsistency(List<DinnerRouteTO> dinnerRoutes, int expectedNumTeamsOnRoutes, Map<UUID, Long> expectedMealClassOccurrences) {
		
		Set<UUID> iteratedCurrentTeams = new HashSet<>();
		Map<UUID, Long> mealClassOccurrences = new HashMap<>();
		
		for (var route : dinnerRoutes) {
			List<DinnerRouteTeamTO> teamsInRoute = route.getTeams();
			int numTeamsInRoute = teamsInRoute.size();
			Assert.state(numTeamsInRoute == expectedNumTeamsOnRoutes, 
									"Route for team " + route.getCurrentTeam() + " contained only " + numTeamsInRoute + " but execpted " + expectedNumTeamsOnRoutes);
			
			TeamTO currentTeam = route.getCurrentTeam();
			Assert.notNull(currentTeam.getId(), "Team " + currentTeam + " contained no ID");
			Assert.state(!iteratedCurrentTeams.contains(currentTeam.getId()), "Team " + currentTeam + " had already another dinner route. It is only allowed to have one (=host)!");
			iteratedCurrentTeams.add(currentTeam.getId());
			
			UUID mealClassId = currentTeam.getMeal().getId();
			mealClassOccurrences.compute(mealClassId, (k, v) -> v == null ? 1 : v + 1);
			
			Set<Integer> uniqueTeamNumbersOnRoute = route.getTeams().stream().map(DinnerRouteTeamTO::getTeamNumber).collect(Collectors.toSet());
			Assert.state(teamsInRoute.size() == uniqueTeamNumbersOnRoute.size(), "Route for team " + currentTeam + " seems to contain duplicated teams");
		} 

		for (var entry : mealClassOccurrences.entrySet()) {
			Long occurrences = entry.getValue();
			Long expectedOccurrences = expectedMealClassOccurrences.get(entry.getKey());
			Assert.state(Objects.equals(occurrences, expectedOccurrences),
					"Expected " + expectedOccurrences + " occurrences for meal " + entry.getKey() + " but was " + occurrences);
		}
	}

	public OptimizationImpact predictOptimizationImpact(@ValidateAdminId String adminId) throws NoPossibleRunningDinnerException {

		TeamHostLocationList teamHostLocations = teamHostLocationService.findTeamHostLocations(adminId);
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		int totalNumberOfTeams = teamHostLocations.getAllTeamHostLocations().size();
		var teamCombinationInfo = TeamCombinationInfo.newInstance(runningDinner.getConfiguration(), totalNumberOfTeams);
		
		Collection<Integer> teamClusterSizes = teamCombinationInfo.getTeamSizeFactorizations().values();
		int sumTeamClusters = teamClusterSizes.stream().mapToInt(Integer::intValue).sum();
		
		boolean hasInvalidTeams = teamHostLocations.teamHostLocationsValid().size() < totalNumberOfTeams;
		if (sumTeamClusters <= 1) {
			return hasInvalidTeams ? OptimizationImpact.NONE : OptimizationImpact.LOW;
		} 
		return (hasInvalidTeams || sumTeamClusters < 3) ? OptimizationImpact.MEDIUM : OptimizationImpact.HIGH;
	}
	
}
