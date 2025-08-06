package org.runningdinner.dinnerroute.optimization;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.optimization.data.DinnerRouteOptimizationRequest;
import org.runningdinner.dinnerroute.optimization.data.MealReference;
import org.runningdinner.dinnerroute.optimization.data.RouteOptimizationSettings;
import org.runningdinner.dinnerroute.optimization.data.TeamReference;
import org.runningdinner.dinnerroute.optimization.data.TeamReferenceService;
import org.runningdinner.feedback.FeedbackService;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

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
	private CreateRunningDinnerWizardService createRunningDinnerWizardService;

	@Autowired
	private TestHelperService testHelperService;

	@BeforeEach
	public void setUp() {

		optimizationDataProviderInMemory = new TestOptimizationDataProvider();

		DinnerRouteOptimizationFeedbackService dinnerRouteOptimizationFeedbackService = new DinnerRouteOptimizationFeedbackService(
			feedbackService,
			mailConfig,
			false
		);

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
			dinnerRouteOptimizationFeedbackService
		);

		this.runningDinner = setUpDinnerWithDemoParticipants();
	}

	@Test
	public void publishEvent() throws TooManyOptimizationRequestsException {

		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

		DinnerRouteOptimizationRequest request = routeOptimizationService.publishOptimizationEvent(runningDinner.getAdminId(), new RouteOptimizationSettings(-1d, -1d));

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

		assertThat(request.getDinnerRoutes()).hasSize(9);
		List<List<TeamReference>> teamsOnRouteList = request.getDinnerRoutes().stream().map(TeamReference::teamsOnRoute).toList();
		assertThat(teamsOnRouteList).allMatch(singleList -> singleList.size() == 2);

//		// This de-serializes back our JSON data that we put like a test fixture in request-template-json file
//		// This is sort of a proof that our JSON serialization is working as expected
		// TODO: The IDs won't match...
//		DinnerRouteOptimizationResult optimizationResult = routeOptimizationService.previewOptimizedDinnerRoutes(runningDinner.getAdminId(), request.getOptimizationId());
//		assertThat(optimizationResult.optimizedDinnerRouteList().getDinnerRoutes()).hasSize(9);
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
