package org.runningdinner.dinnerroute.optimization;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.dinnerroute.DinnerRouteService;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.optimization.local.TeamMemberChange;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestGeocodeHelperService;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class DinnerRouteOptimizationServiceTest {
	
	@Autowired
	private DinnerRouteOptimizationService dinnerRouteOptimizationService;

	@Autowired
	private TeamService teamService;
	
	@Autowired
	private DinnerRouteService dinnerRouteService;

	@Autowired
	private TestHelperService testHelperService;
	
	@Autowired
	private TestGeocodeHelperService testGeocodeHelperService;
	
	private RunningDinner runningDinner;
	
	@Test
	public void calculateOptimizationDefault() throws NoPossibleRunningDinnerException {
		setUpDefaultDinner(2 * 27);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
		
		testGeocodeHelperService.fillAllTeamsWithTeamNumberGeocodes(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());

		assertThat(teamIds).hasSize(27);
		
		// Just some assertion before
		assertAllDinnerRoutes(27);
		
		DinnerRouteOptimizationResult optimizationResult = dinnerRouteOptimizationService.calculateOptimization(runningDinner.getAdminId(), newCalculateOptimizationRequest());
		DinnerRouteListTO optimizedDinnerRouteList = optimizationResult.optimizedDinnerRouteList();
		
		dinnerRouteOptimizationService.validateOptimizedRoutes(optimizedDinnerRouteList.getDinnerRoutes(), runningDinner, teams);
		// All assertions are already performed in validate method
		assertThat(true).isTrue();
	}
	
	@Test
	public void calculateOptimizationTwoMealClasses() throws NoPossibleRunningDinnerException {
		
		setUpDefaultDinnerTwoMeals(2 * 12);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

		testGeocodeHelperService.fillAllTeamsWithTeamNumberGeocodes(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());

		assertThat(teamIds).hasSize(12);
		
		DinnerRouteOptimizationResult optimizationResult = dinnerRouteOptimizationService.calculateOptimization(runningDinner.getAdminId(), newCalculateOptimizationRequest());
		DinnerRouteListTO optimizedDinnerRouteList = optimizationResult.optimizedDinnerRouteList();
		
		dinnerRouteOptimizationService.validateOptimizedRoutes(optimizedDinnerRouteList.getDinnerRoutes(), runningDinner, teams);
		// All assertions are already performed in validate method
		assertThat(true).isTrue();
	}
	
	@Test
	public void calculateOptimizationWithOneCancelledTeam() throws NoPossibleRunningDinnerException {
		setUpDefaultDinner(2 * 12);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

		testGeocodeHelperService.fillAllTeamsWithTeamNumberGeocodes(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());
		assertThat(teamIds).hasSize(12);
		
		Team cancelledTeam = teams.get(0);
		teamService.cancelTeam(runningDinner.getAdminId(), TestUtil.newCancellationWithoutReplacement(cancelledTeam));
		
		assertAllDinnerRoutesWithoutCancelledTeams(11, cancelledTeam);
		
		// Reload
		teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		
		DinnerRouteOptimizationResult optimizationResult = dinnerRouteOptimizationService.calculateOptimization(runningDinner.getAdminId(), newCalculateOptimizationRequest());
		DinnerRouteListTO optimizedDinnerRouteList = optimizationResult.optimizedDinnerRouteList();

		dinnerRouteOptimizationService.validateOptimizedRoutes(optimizedDinnerRouteList.getDinnerRoutes(), runningDinner, teams);
		// All assertions are already performed in validate method
		assertThat(true).isTrue();
	}
	
	@Test
	public void calculateOptimizationWithTwoCancelledTeams() throws NoPossibleRunningDinnerException {
		setUpDefaultDinner(2 * 27);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());

		testGeocodeHelperService.fillAllTeamsWithTeamNumberGeocodes(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());
		assertThat(teamIds).hasSize(27);
		
		Team firstCancelledTeam = teams.getFirst();
		Team lastCancelledTeam = teams.getLast();
		teamService.cancelTeam(runningDinner.getAdminId(), TestUtil.newCancellationWithoutReplacement(firstCancelledTeam));
		teamService.cancelTeam(runningDinner.getAdminId(), TestUtil.newCancellationWithoutReplacement(lastCancelledTeam));
		
		assertAllDinnerRoutesWithoutCancelledTeams(25, lastCancelledTeam, lastCancelledTeam);
		
		// Reload
		teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		
		DinnerRouteOptimizationResult optimizationResult = dinnerRouteOptimizationService.calculateOptimization(runningDinner.getAdminId(), newCalculateOptimizationRequest());
		DinnerRouteListTO optimizedDinnerRouteList = optimizationResult.optimizedDinnerRouteList();

		dinnerRouteOptimizationService.validateOptimizedRoutes(optimizedDinnerRouteList.getDinnerRoutes(), runningDinner, teams);
		// All assertions are already performed in validate method
		assertThat(true).isTrue();
	}
	
	@Test
	public void calculateOptimizationWithInvalidGeocodes() throws NoPossibleRunningDinnerException {
		setUpDefaultDinner(2 * 27);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
		
		testGeocodeHelperService.fillAllTeamsWithTeamNumberGeocodes(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());
		assertThat(teamIds).hasSize(27);
		
		assertAllDinnerRoutes(27);
		
		testGeocodeHelperService.fillTeamsWithInvalidGeocodes(runningDinner.getAdminId(), List.of(teams.getFirst(), teams.getLast()));

		int firstTeamNumber = teams.getFirst().getTeamNumber(); 
		int lastTeamNumber = teams.getLast().getTeamNumber();
		
		DinnerRouteOptimizationResult optimizationResult = dinnerRouteOptimizationService.calculateOptimization(runningDinner.getAdminId(), newCalculateOptimizationRequest());
		DinnerRouteListTO optimizedDinnerRouteList = optimizationResult.optimizedDinnerRouteList();

		dinnerRouteOptimizationService.validateOptimizedRoutes(optimizedDinnerRouteList.getDinnerRoutes(), runningDinner, teams);
		// All assertions are already performed in validate method
		assertThat(true).isTrue();
		
		List<Integer> dinnerRouteTeamNumbers = optimizedDinnerRouteList.getDinnerRoutes().stream().map(route -> route.getCurrentTeam().getTeamNumber()).toList();
		assertThat(dinnerRouteTeamNumbers).contains(firstTeamNumber, lastTeamNumber);
		
		// We have 3 team-clusters. Assert that first- and last team occurs in two of the three clusters:
		var teamClusterMappingsEntrySet = optimizedDinnerRouteList.getTeamClusterMappings().entrySet();
		assertThat(teamClusterMappingsEntrySet).hasSize(3);
		long firstOrLastTeamOccurrencesSum = 0;
		for (var teamClusterMappingsEntry : teamClusterMappingsEntrySet) {
			LinkedHashSet<Integer> teamNumbersInCluster = teamClusterMappingsEntry.getValue();
			long firstOrLastTeamOccurrences = teamNumbersInCluster.stream().filter(teamNr -> teamNr == firstTeamNumber || teamNr == lastTeamNumber).count();
			assertThat(firstOrLastTeamOccurrences).isLessThanOrEqualTo(1);
			firstOrLastTeamOccurrencesSum += firstOrLastTeamOccurrences;
		}
		assertThat(firstOrLastTeamOccurrencesSum).isEqualTo(2);
	}

	@Test
	public void saveNewDinnerRoutes() throws NoPossibleRunningDinnerException {
		
		setUpDefaultDinner(2 * 27);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Set<UUID> teamIds = teams.stream().map(Team::getId).collect(Collectors.toSet());

		assertThat(teamIds).hasSize(27);
		
		DinnerRouteListTO routesList = assertAllDinnerRoutes(27);
		
		// For the save logic it is not really relevant if we have an optimized route (with changes) or if we just use the same route.
		// It matters however if we have some team member changes:
		List<TeamMemberChange> teamMemberChanges = new ArrayList<>();
		UUID teamId1 = teams.get(0).getId();
		UUID teamId2 = teams.get(1).getId();
		teamMemberChanges.add(new TeamMemberChange(teamId1, teamId2));
		teamMemberChanges.add(new TeamMemberChange(teamId2, teamId1));
		
		List<Participant> teamMembersOfTeam1BeforeSave = teams.get(0).getTeamMembersOrdered();
		List<Participant> teamMembersOfTeam2BeforeSave = teams.get(1).getTeamMembersOrdered();
		
		SaveDinnerRouteOptimizationRequest saveRequest = new SaveDinnerRouteOptimizationRequest(routesList.getDinnerRoutes(), teamMemberChanges);
		dinnerRouteOptimizationService.saveNewDinnerRoutes(runningDinner.getAdminId(), saveRequest);
		
		teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		Team team1 = IdentifierUtil.filterListForIdMandatory(teams, teamId1);
		Team team2 = IdentifierUtil.filterListForIdMandatory(teams, teamId2);
	 
		assertThat(team1.getTeamMembersOrdered()).containsExactlyElementsOf(teamMembersOfTeam2BeforeSave);
		assertThat(team2.getTeamMembersOrdered()).containsExactlyElementsOf(teamMembersOfTeam1BeforeSave);
		
		assertAllDinnerRoutes(27);
	}
	
	private DinnerRouteListTO assertAllDinnerRoutesWithoutCancelledTeams(int expectedSize, Team ... cancelledTeams) {
		DinnerRouteListTO allDinnerRoutes = dinnerRouteService.findAllDinnerRoutes(runningDinner.getAdminId());
		List<Team> allCurrentRouteTeams = mapRoutesToTeams(allDinnerRoutes.getDinnerRoutes());
		assertThat(allCurrentRouteTeams).doesNotContain(cancelledTeams);
		assertThat(allDinnerRoutes.getDinnerRoutes()).hasSize(expectedSize);
		return allDinnerRoutes;
	}
	
	private DinnerRouteListTO assertAllDinnerRoutes(int expectedSize) {
		// Just some assertion before
		DinnerRouteListTO routes = dinnerRouteService.findAllDinnerRoutes(runningDinner.getAdminId());
		for (var route : routes.getDinnerRoutes()) {
			assertThat(route.getTeams()).hasSize(3);
		}
		assertThat(routes.getDinnerRoutes()).hasSize(expectedSize);
		return routes;
	}
	
  private List<Team> mapRoutesToTeams(List<DinnerRouteTO> dinnerRoutes) {
  	Set<Integer> teamNumbersInRoutes = dinnerRoutes.stream().map(route -> route.getCurrentTeam().getTeamNumber()).collect(Collectors.toSet());
  	return teamService.findTeamsWithMembersOrderedByTeamNumbers(this.runningDinner.getAdminId(), teamNumbersInRoutes);
	}

	protected RunningDinner setUpDefaultDinner(int numParticipants) {
    LocalDate dinnerDate = LocalDate.now().plusDays(7);
    this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(dinnerDate, numParticipants);
    return this.runningDinner;
  }	
  
  protected RunningDinner setUpDefaultDinnerTwoMeals(int numParticipants) {
    LocalDate dinnerDate = LocalDate.now().plusDays(7);
    this.runningDinner = testHelperService.createRunningDinnerTwoMealsWithParticipants(dinnerDate, numParticipants, RegistrationType.CLOSED);
    return this.runningDinner;
  }
  
  static CalculateDinnerRouteOptimizationRequest newCalculateOptimizationRequest() {
  	return new CalculateDinnerRouteOptimizationRequest(0.0, 0.0);
  }
}
