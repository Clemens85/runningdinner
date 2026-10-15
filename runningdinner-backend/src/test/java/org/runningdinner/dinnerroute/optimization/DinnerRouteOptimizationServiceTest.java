package org.runningdinner.dinnerroute.optimization;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.TeamDistributorAccessibility;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.optimization.data.DinnerRouteOptimizationRequest;
import org.runningdinner.dinnerroute.optimization.data.MealReference;
import org.runningdinner.dinnerroute.optimization.data.RouteOptimizationSettings;
import org.runningdinner.dinnerroute.optimization.data.TeamReference;
import org.runningdinner.dinnerroute.optimization.data.TeamReferenceService;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.feedback.FeedbackService;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class DinnerRouteOptimizationServiceTest {

	private DinnerRouteOptimizationService routeOptimizationService;

	private TestOptimizationDataProvider optimizationDataProviderInMemory;

	private RunningDinner runningDinner;

	@Autowired
	private RunningDinnerService runningDinnerService;

	@Autowired
	private DinnerRouteService dinnerRouteService;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private TeamService teamService;

	@Autowired
	private TeamRepository teamRepository;

	@Autowired
	private ParticipantRepository participantRepository;

	@Autowired
	private TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

	@Autowired
	private DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

	@Autowired
	private TeamReferenceService teamReferenceService;

	@Autowired
	private FeedbackService feedbackService;

	@Autowired
	private MailConfig mailConfig;

	@Autowired
	private EventPublisher eventPublisher;

	@Autowired
	private CreateRunningDinnerWizardService createRunningDinnerWizardService;

	@Autowired
	private TestHelperService testHelperService;

	@BeforeEach
	public void setUp() {

		optimizationDataProviderInMemory = spy(new TestOptimizationDataProvider());

		this.routeOptimizationService = new DinnerRouteOptimizationService(
			runningDinnerService,
			dinnerRouteService,
			objectMapper,
			teamService,
			teamRepository,
			optimizationDataProviderInMemory,
			teamNeighbourClusterCalculationService,
			dinnerRouteMessageFormatter,
			teamReferenceService,
			eventPublisher
		);

		this.runningDinner = setUpDinnerWithDemoParticipants();
	}

	@Test
	public void publishEvent() throws TooManyOptimizationRequestsException {

		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

		DinnerRouteOptimizationRequest request = routeOptimizationService.publishOptimizationEvent(runningDinner.getAdminId(), new RouteOptimizationSettings(-1d, -1d, false, 0));

		// Assert event is published
		assertThat(this.optimizationDataProviderInMemory.getRequestData()).isNotBlank();

		// Assert event data was properly mapped
		assertThat(request.getAdminId()).isEqualTo(runningDinner.getAdminId());
		assertThat(request.getOptimizationId()).isNotBlank();

		assertThat(request.getMeals()).hasSize(3);
		List<String> mealLabels = request.getMeals().stream().map(MealReference::label).toList();
		assertThat(mealLabels).containsExactly("Vorspeise", "Hauptspeise", "Nachspeise");

		assertThat(request.getDistanceMatrix()).isNotEmpty();
		assertThat(request.getClusterSizes()).hasSize(1);
		assertThat(request.getClusterSizes().get(1)).containsExactlyInAnyOrder(1, 2, 3, 4, 5, 6, 7, 8, 9);

		assertThat(request.getOptimizationSettings().currentAverageDistanceInMeters()).isEqualTo(-1d);
		assertThat(request.getOptimizationSettings().currentSumDistanceInMeters()).isEqualTo(-1d);
		assertThat(request.getOptimizationSettings().ignoreMealAssignments()).isFalse();
		assertThat(request.getOptimizationSettings().minimumDistanceInMeters()).isEqualTo(0);

		assertThat(request.getDinnerRoutes()).hasSize(9);
		List<List<TeamReference>> teamsOnRouteList = request.getDinnerRoutes().stream().map(TeamReference::teamsOnRoute).toList();
		assertThat(teamsOnRouteList).allMatch(singleList -> singleList.size() == 2);

	}

	@ParameterizedTest
	@ValueSource(booleans = { false, true })
	@Transactional
	public void previewMatchesAppliedAccessibilityRepair(boolean ignoreMealAssignments) throws Exception {

		String adminId = runningDinner.getAdminId();
		teamService.createTeamAndVisitationPlans(adminId);
		List<Team> teams = teamService.findTeamArrangements(adminId, false);
		Team requiringTeam = teams.getFirst();
		Set<Team> inaccessibleHosts = Set.copyOf(requiringTeam.getHostTeams());
		for (Team team : teams) {
			team.getTeamMembers().forEach(member -> member.setRequiresAccessibleHome(false));
			Participant host = team.getHostTeamMember();
			host.setNumSeats(6);
			host.setHomeAccessible(!inaccessibleHosts.contains(team));
			participantRepository.saveAll(team.getTeamMembers());
		}
		requiringTeam.getHostTeamMember().setRequiresAccessibleHome(true);
		participantRepository.save(requiringTeam.getHostTeamMember());
		assertThat(inaccessibleHosts).hasSize(2);

		DinnerRouteOptimizationRequest request = routeOptimizationService.publishOptimizationEvent(adminId,
				new RouteOptimizationSettings(-1d, -1d, ignoreMealAssignments, 0));
		doReturn(objectMapper.writeValueAsString(request)).when(optimizationDataProviderInMemory).readResponseData(adminId, request.getOptimizationId());

		var preview = routeOptimizationService.previewOptimizedDinnerRoutes(adminId, request.getOptimizationId());
		var applied = routeOptimizationService.applyOptimizedDinnerRoutes(adminId, request.getOptimizationId());

		assertThat(routeNumbers(applied.getDinnerRoutes())).isEqualTo(routeNumbers(preview.optimizedDinnerRouteList().getDinnerRoutes()));
		assertThat(requiringTeam.getHostTeams()).allMatch(host -> TeamDistributorAccessibility.hasAccessibleHostLocation(host, runningDinner.getConfiguration()));
		routeOptimizationService.validateOptimizedRoutes(applied.getDinnerRoutes(), runningDinner, teams);
	}

	private static Map<Integer, List<Integer>> routeNumbers(List<DinnerRouteTO> routes) {

		return routes.stream().collect(Collectors.toMap(route -> route.getCurrentTeam().getTeamNumber(),
				route -> route.getTeams().stream().map(team -> team.getTeamNumber()).sorted().toList()));
	}

	// TODO: Add Test for imputation of missing geocodes

	// TODO Test metadata methods in lock handling

	// TODO Add test for error handling in JSON

	protected RunningDinner setUpDinnerWithDemoParticipants() {
		LocalDate dinnerDate = LocalDate.now().plusDays(7);
		List<Participant> participants = createRunningDinnerWizardService.readDemoParticipants();
		return testHelperService.createRunningDinnerWithParticipants(dinnerDate, participants, RegistrationType.CLOSED);
	}
}
