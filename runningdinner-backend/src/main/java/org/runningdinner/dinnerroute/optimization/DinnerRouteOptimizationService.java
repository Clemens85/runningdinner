package org.runningdinner.dinnerroute.optimization;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamCombinationInfo;
import org.runningdinner.dinnerroute.AllDinnerRoutesWithDistancesListTO;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.DinnerRouteTeamTO;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.optimization.data.DinnerRouteOptimizationRequest;
import org.runningdinner.dinnerroute.optimization.data.MealReference;
import org.runningdinner.dinnerroute.optimization.data.OptimizationDataProvider;
import org.runningdinner.dinnerroute.optimization.data.TeamReference;
import org.runningdinner.dinnerroute.optimization.data.TeamReferenceResultList;
import org.runningdinner.dinnerroute.optimization.data.TeamReferenceService;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamAccessor;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

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

@Service
public class DinnerRouteOptimizationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizationService.class);

	private final RunningDinnerService runningDinnerService;

	private final DinnerRouteService dinnerRouteService;

	private final ObjectMapper objectMapper;

	private final TeamService teamService;

	private final TeamRepository teamRepository;

	private final OptimizationDataProvider optimizationDataProvider;

	private final TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

	private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

	private final TeamReferenceService teamReferenceService;

	private final DinnerRouteOptimizationFeedbackService dinnerRouteOptimizationFeedbackService;

	public DinnerRouteOptimizationService(RunningDinnerService runningDinnerService,
																				DinnerRouteService dinnerRouteService,
																				ObjectMapper objectMapper,
																				TeamService teamService,
																				TeamRepository teamRepository,
																				OptimizationDataProvider optimizationDataProvider,
																				TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService,
																				DinnerRouteMessageFormatter dinnerRouteMessageFormatter,
																				TeamReferenceService teamReferenceService, DinnerRouteOptimizationFeedbackService dinnerRouteOptimizationFeedbackService) {

		this.runningDinnerService = runningDinnerService;
		this.dinnerRouteService = dinnerRouteService;
		this.objectMapper = objectMapper;
		this.teamService = teamService;
		this.teamRepository = teamRepository;
		this.optimizationDataProvider = optimizationDataProvider;
		this.teamNeighbourClusterCalculationService = teamNeighbourClusterCalculationService;
		this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
		this.teamReferenceService = teamReferenceService;
		this.dinnerRouteOptimizationFeedbackService = dinnerRouteOptimizationFeedbackService;
	}

	public DinnerRouteOptimizationRequest publishOptimizationEvent(@ValidateAdminId String adminId,
																																 @Valid CalculateDinnerRouteOptimizationRequest calculateRequest) throws TooManyOptimizationRequestsException {

		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

		TeamReferenceResultList teamReferenceResultList = teamReferenceService.findTeamReferences(runningDinner, true);

		double[][] distanceMatrix = DinnerRouteOptimizationUtil.mapToDistanceMatrix(teamReferenceResultList.teamReferences());

		String optimizationId = UUID.randomUUID().toString().split("-")[0];

		List<MealReference> meals = TeamReferenceService.mapMealReferences(runningDinner);

		DinnerRouteOptimizationRequest finalRequest = new DinnerRouteOptimizationRequest(
				runningDinner.getAdminId(),
				optimizationId,
				meals,
				teamReferenceResultList.teamReferences(),
				distanceMatrix,
				teamReferenceResultList.dinnerRouteList().getTeamClusterMappings()
		);

		publishRequest(finalRequest);
		return finalRequest;
	}

	@Transactional
	public DinnerRouteListTO applyOptimizedDinnerRoutes(@ValidateAdminId String adminId, String optimizationId) throws NoPossibleRunningDinnerException {

		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

		List<Team> existingTeams = teamService.findTeamArrangements(adminId, false);

		applyOptimizedRoutesToTeams(adminId, optimizationId, existingTeams);

		existingTeams = teamRepository.saveAll(existingTeams);

		DinnerRouteListTO optimizedRoutes = dinnerRouteService.findAllDinnerRoutes(adminId);
		// Finally we validate the optimized routes thus ensuring we won't save any inconsistent data
		validateOptimizedRoutes(optimizedRoutes.getDinnerRoutes(), runningDinner, existingTeams);

		return optimizedRoutes;
	}

	public DinnerRouteOptimizationResult previewOptimizedDinnerRoutes(@ValidateAdminId String adminId, String optimizationId) {
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

		List<Team> existingTeams = teamService.findTeamArrangements(adminId, false);
		List<Team> teamClones = existingTeams
															.stream()
															.map(team -> {
																		Team teamClone = team.createDetachedClone(false);
																		preserveDatabaseIds(teamClone, team);
																		return teamClone;
															})
															.toList();

		applyOptimizedRoutesToTeams(adminId, optimizationId, teamClones);

		DinnerRouteCalculator dinnerRouteCalculator = new DinnerRouteCalculator(runningDinner, dinnerRouteMessageFormatter);
		List<DinnerRouteTO> optimizedDinnerRoutes = DinnerRouteOptimizationUtil.buildDinnerRoute(teamClones, dinnerRouteCalculator);

		Map<Integer, LinkedHashSet<Integer>> teamClusterMappings = DinnerRouteCalculator.reverseCalculateClustersOfTeams(optimizedDinnerRoutes);
		AllDinnerRoutesWithDistancesListTO optimizedDinnerRoutesWithDistances = DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(optimizedDinnerRoutes);
		List<TeamNeighbourCluster> teamNeighbourClusters = teamNeighbourClusterCalculationService.calculateTeamNeighbourClusters(adminId, teamClones, 0);

		DinnerRouteListTO optimizedDinnerRouteList = new DinnerRouteListTO(optimizedDinnerRoutes, teamClusterMappings, new TeamNeighbourClusterListTO(teamNeighbourClusters));

		var result = new DinnerRouteOptimizationResult(optimizationId,
																									 optimizedDinnerRouteList,
																									 optimizedDinnerRoutesWithDistances,
																									 new TeamNeighbourClusterListTO(teamNeighbourClusters));

		try {
			dinnerRouteOptimizationFeedbackService.sendOptimizationFeedbackAsync(adminId, result, calculateRequest.currentSumDistanceInMeters(), calculateRequest.currentAverageDistanceInMeters());
		} catch (Exception e) {
			LOGGER.error("Could not call sendOptimizationFeedbackAsync", e);
		}

		return result;
	}

	private void applyOptimizedRoutesToTeams(String adminId, String optimizationId, List<Team> teams) {

		teams.forEach(Team::removeAllTeamReferences);
		var response = readOptimizedResponse(adminId, optimizationId);
		List<TeamReference> optimizedTeams = response.getDinnerRoutes();

		Map<TeamReference, Team> teamReferencesToTeams = TeamReferenceService.mapTeamReferencesToTeams(optimizedTeams, teams);

		// Create Map of optimizedTeams per clusterNumber
		Map<Integer, List<TeamReference>> teamsByClusterNumber = optimizedTeams
						.stream()
						.collect(Collectors.groupingBy(TeamReference::clusterNumber));
		// Iterate over each clusterNumber and create Team objects
		for (Map.Entry<Integer, List<TeamReference>> entry : teamsByClusterNumber.entrySet()) {
			List<TeamReference> teamsOfCluster = entry.getValue();

			for (var teamReference : teamsOfCluster) {
				Team existingTeam = teamReferencesToTeams.get(teamReference);
				List<TeamReference> hostReferences = teamReference.teamsOnRoute();
				TeamReferenceService.getTeamsFromReferences(hostReferences, teamReferencesToTeams)
															.forEach(existingTeam::addHostTeam);
			}
		}
	}

	public OptimizationImpact predictOptimizationImpact(@ValidateAdminId String adminId) throws NoPossibleRunningDinnerException {
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		TeamReferenceResultList teamReferenceResultList = teamReferenceService.findTeamReferences(runningDinner, true);
		List<TeamReference> teamReferences = teamReferenceResultList.teamReferences();

		int totalNumberOfTeams = teamReferences.size();
		var teamCombinationInfo = TeamCombinationInfo.newInstance(runningDinner.getConfiguration(), totalNumberOfTeams);

		Collection<Integer> teamClusterSizes = teamCombinationInfo.getTeamSizeFactorizations().values();
		int sumTeamClusters = teamClusterSizes.stream().mapToInt(Integer::intValue).sum();

		if (!DinnerRouteOptimizationUtil.hasEnoughValidGeocodingResults(teamReferences)) {
			return OptimizationImpact.NONE;
		}
		if (sumTeamClusters == 1) {
			return OptimizationImpact.LOW;
		}
		return sumTeamClusters < 3 ? OptimizationImpact.MEDIUM : OptimizationImpact.HIGH;
	}

	private void publishRequest(DinnerRouteOptimizationRequest finalRequest) throws TooManyOptimizationRequestsException {
		try {
			String requestJsonString = objectMapper.writeValueAsString(finalRequest);
			optimizationDataProvider.writeRequestData(finalRequest.getAdminId(), finalRequest.getOptimizationId(), requestJsonString);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}

	private DinnerRouteOptimizationRequest readOptimizedResponse(String adminId, String optimizationId) {
		String responseJson = optimizationDataProvider.readResponseData(adminId, optimizationId);
		try {
			JsonNode rootNode = objectMapper.readTree(responseJson);
			if (rootNode.has("error")) {
				String errorMessage = rootNode.get("error").asText();
				LOGGER.error("Error in optimization response for adminId: {} and optimizationId: {}: {}", adminId, optimizationId, errorMessage);
				throw new IllegalStateException("Error in optimization response: " + errorMessage);
			}
			return objectMapper.treeToValue(rootNode, DinnerRouteOptimizationRequest.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Error while reading optimized response for adminId: " + adminId + " and optimizationId: " + optimizationId, e);
		}
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

	// We need IDs (as teams would be in database) later on for dinner route building
	static void preserveDatabaseIds(Team detachedTeamClone, Team originalTeam) {
		List<Participant> originalParticipants = originalTeam.getTeamMembersOrdered();
		TeamAccessor.newAccessor(detachedTeamClone)
						.setId(originalTeam.getId())
						.setMealClassId(originalTeam.getMealClass().getId())
						.setTeamMemberIds(originalParticipants);
	}

}
