package org.runningdinner.dinnerroute.optimization;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;


@ExtendWith(SpringExtension.class)
@ApplicationTest
public class LocalClusterOptimizerTest {

	private RunningDinner runningDinner;
	
	@Autowired
	private TestHelperService testHelperService;
	
	@Autowired
	private TeamService teamService;
		
	@Autowired
	private DinnerRouteMessageFormatter routeMessageFormatter;

	@Test
	public void calculateLocalClusterOptimizations_9() {
		
		List<Team> teams = setUpDefaultDinnerAndGenerateTeams(2 * 9);
		
		TeamHostLocationList teamHostLocationList = generateTeamHostLocations(teams);
		simulateGeocodesOutliers4(teamHostLocationList);
		
		LocalClusterOptimizationResult result = calculateLocalClusterOptimizations(teamHostLocationList);
		assertThat(result.getAllTeamMemberChanges()).isNotEmpty();
		assertThat(result.hasOptimizations()).isTrue();
	}
	
	@Test
	public void calculateLocalClusterOptimizationsWithoutChanges_9() {
		
		List<Team> teams = setUpDefaultDinnerAndGenerateTeams(2 * 9);
		
		TeamHostLocationList teamHostLocationList = generateTeamHostLocations(teams);
		simulateSameGeocodes(teamHostLocationList);
		
		LocalClusterOptimizationResult result = calculateLocalClusterOptimizations(teamHostLocationList);
		assertThat(result.getAllTeamMemberChanges()).isEmpty();
		assertThat(result.hasOptimizations()).isFalse();
	}
	
	private void simulateSameGeocodes(TeamHostLocationList teamHostLocationList) {
		teamHostLocationList.teamHostLocationsValid().stream().forEach(thl -> GeocodeTestUtil.setGeocodeData(thl, 7.0, 7.0));
	}

	/**
	 * Create some "outliers" which should yield into changes later
	 */
	private void simulateGeocodesOutliers4(TeamHostLocationList teamHostLocationList) {
		List<TeamHostLocation> teamLocations = teamHostLocationList.teamHostLocationsValid();
		GeocodeTestUtil.setGeocodeData(teamLocations.getFirst(), 177, 177);
		GeocodeTestUtil.setGeocodeData(teamLocations.getLast(), 176, 176);
		GeocodeTestUtil.setGeocodeData(teamLocations.get(3), 175, 175);
		GeocodeTestUtil.setGeocodeData(teamLocations.get(5), 166, 166);
	}

	private TeamHostLocationList generateTeamHostLocations(List<Team> teams) {
		List<TeamHostLocation> teamLocations = new ArrayList<>();
		GeocodedAddressEntityListTO teamsWithGeocodes = GeocodeTestUtil.mapToGeocodedAddressEntityList(teams);
		for (int i = 0; i < teams.size(); i++) {
			teamLocations.add(new TeamHostLocation(teams.get(i), teamsWithGeocodes.getAddressEntities().get(i)));
		}
		return new TeamHostLocationList(teamLocations, Collections.emptyList(), Collections.emptyList());
	}

	protected List<Team> setUpDefaultDinnerAndGenerateTeams(int numParticipants) {
    LocalDate dinnerDate = LocalDate.now().plusDays(7);
		this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(dinnerDate, numParticipants);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
		return teams.stream().map(t -> {
	    TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(runningDinner.getAdminId(), t.getId());
	    return teamMeetingPlan.getTeam();
		})
		.toList();
  }	
	
	private static Map<Integer, LinkedHashSet<Integer>> toSingleTeamClusterMapping(List<TeamHostLocation> allTeamHostLocations) {
		return Map.of(
			1,
			new LinkedHashSet<>(allTeamHostLocations.stream().map(thl -> thl.getTeam().getTeamNumber()).toList())	
		);
	}
	
	private LocalClusterOptimizationResult calculateLocalClusterOptimizations(TeamHostLocationList teamHostLocationList) {
		DinnerRouteCalculator routeCalculator = new DinnerRouteCalculator(this.runningDinner, this.routeMessageFormatter);
		LocalClusterOptimizer localClusterOptimizer = new LocalClusterOptimizer(routeCalculator, toSingleTeamClusterMapping(teamHostLocationList.getAllTeamHostLocations()));
		return localClusterOptimizer.calculateLocalClusterOptimizations(teamHostLocationList);
	}
	
}
