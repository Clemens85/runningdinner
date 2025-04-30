//package org.runningdinner.dinnerroute.optimization;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//import java.time.LocalDate;
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.LinkedHashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.runningdinner.core.RunningDinner;
//import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
//import org.runningdinner.participant.Team;
//import org.runningdinner.participant.TeamService;
//import org.runningdinner.test.util.ApplicationTest;
//import org.runningdinner.test.util.TestHelperService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.test.context.junit.jupiter.SpringExtension;
//
//@ExtendWith(SpringExtension.class)
//@ApplicationTest
//public class PermutationTest {
//
//	private RunningDinner runningDinner;
//	
//	@Autowired
//	private TestHelperService testHelperService;
//	
//	@Autowired
//	private TeamService teamService;
//	
//	@Test
//	public void buildPermutations() {
//		
//		List<Team> teams = setUpDefaultDinnerAndGenerateTeams(2 * 9);
//		TeamHostLocationList teamHostLocationList = generateTeamHostLocations(teams);
//		
//		List<TeamHostLocation> vorspeiseTeams = new ArrayList<>(teamHostLocationList.getAllTeamHostLocations().stream().filter(thl -> thl.getTeam().getMealClass().getLabel().equals("Vorspeise")).toList());
//		
//		System.out.println("*** BEFORE: Original List: " + vorspeiseTeams);
//		
//		List<List<TeamHostLocation>> result = LocalClusterOptimizer.buildPermutations(vorspeiseTeams);
//		assertThat(result).hasSize(6);
//		int cnt = 1;
//		for (var permutationRow : result) {
//			System.out.println("#" + (cnt++) + ": " + permutationRow);
//		}		
//		
//		System.out.println("*** AFTER: Original List: " + vorspeiseTeams);
//	}
//	
//	
//	@Test
//	public void cartesianProduct() {
//		
//		List<Team> teams = setUpDefaultDinnerAndGenerateTeams(2 * 9);
//		TeamHostLocationList teamHostLocationsOfCluster = generateTeamHostLocations(teams);
//		
//		
//		List<TeamHostLocation> teamHostLocationsValid = teamHostLocationsOfCluster.teamHostLocationsValid();
//		Map<UUID, List<TeamHostLocation>> locationsByMeal = teamHostLocationsOfCluster.teamHostLocationsValid()
//																													.stream()
//																													.collect(Collectors.groupingBy(thl -> thl.getMeal().getId()));
//		
//		List<List<List<TeamHostLocation>>> allPermutations = new ArrayList<>();
//		for (var entrySet : locationsByMeal.entrySet()) {
//			List<List<TeamHostLocation>> permutationsByMeal = LocalClusterOptimizer.buildPermutations(entrySet.getValue());
//			
//			int cnt = 1;
//			for (var permutationRow : permutationsByMeal) {
//				System.out.println("# " + entrySet.getKey().toString().substring(0, 8) + " # " + (cnt++) + ": " + permutationRow);
//			}		
//			
//			allPermutations.add(permutationsByMeal);
//		}
//
//		System.out.println("*** RESULT ***");
//		List<List<TeamHostLocation>> allPossibleClusterVariants = LocalClusterOptimizer.cartesianProduct2(allPermutations);
//		for (var possibleClusterVariant : allPossibleClusterVariants) {
//			System.out.println(possibleClusterVariant);
//		}
//		
//	}
//	
//	private TeamHostLocationList generateTeamHostLocations(List<Team> teams) {
//		List<TeamHostLocation> teamLocations = new ArrayList<>();
//		GeocodedAddressEntityListTO teamsWithGeocodes = GeocodeTestUtil.mapToGeocodedAddressEntityList(teams);
//		for (int i = 0; i < teams.size(); i++) {
//			teamLocations.add(new TeamHostLocation(teams.get(i), teamsWithGeocodes.getAddressEntities().get(i)));
//		}
//		return new TeamHostLocationList(teamLocations, Collections.emptyList(), Collections.emptyList());
//	}
//
//	protected List<Team> setUpDefaultDinnerAndGenerateTeams(int numParticipants) {
//    LocalDate dinnerDate = LocalDate.now().plusDays(7);
//		this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(dinnerDate, numParticipants);
//		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
//		return teamService.findTeamArrangements(runningDinner.getAdminId(), false);
//  }	
//	
//	private static Map<Integer, LinkedHashSet<Integer>> toSingleTeamClusterMapping(List<TeamHostLocation> allTeamHostLocations) {
//		return Map.of(
//			1,
//			new LinkedHashSet<>(allTeamHostLocations.stream().map(thl -> thl.getTeam().getTeamNumber()).toList())	
//		);
//	}
//	
//}
