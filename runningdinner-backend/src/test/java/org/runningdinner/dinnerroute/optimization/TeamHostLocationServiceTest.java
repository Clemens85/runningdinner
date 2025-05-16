package org.runningdinner.dinnerroute.optimization;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocation;
import org.runningdinner.dinnerroute.teamhostlocation.TeamHostLocationService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class TeamHostLocationServiceTest {

	@Autowired
	private TeamHostLocationService teamHostLocationService;

	@Autowired
	private TeamService teamService;

	@Autowired
	private TestHelperService testHelperService;
	
	private RunningDinner runningDinner;
	
	@Test
	public void maptoTeamHostLocations() {
		// 54 participants, which yield into 27 teams:
		setUpDefaultDinner(2 * 27);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
		
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);

		GeocodedAddressEntityListTO geocodedAddressEntityList = GeocodeTestUtil.mapToGeocodedAddressEntityList(teams); 
		
		List<TeamHostLocation> result = teamHostLocationService.mapToTeamHostLocations(runningDinner.getAdminId(), geocodedAddressEntityList).teamHostLocationsValid();
		assertThat(result).hasSize(27);
		
		for (int i = 0; i < result.size(); i++) {
			
			var teamHostLocation = result.get(i);
			
			int expectedTeamNumber = i + 1;
			assertThat(teamHostLocation.getId()).isEqualTo(expectedTeamNumber + "");
			assertThat(teamHostLocation.getTeamNumber()).isEqualTo(expectedTeamNumber);
			
			Team originalTeam = teams.get(i);
			assertThat(teamHostLocation.getTeam().getId()).isEqualTo(originalTeam.getId());
			assertThat(teamHostLocation.getMeal().getId()).isEqualTo(originalTeam.getMealClass().getId());
			assertThat(teamHostLocation.getLat()).isEqualTo(expectedTeamNumber);
		}
		
	}
	
  protected RunningDinner setUpDefaultDinner(int numParticipants) {
    LocalDate dinnerDate = LocalDate.now().plusDays(7);
    this.runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(dinnerDate, numParticipants);
    return this.runningDinner;
  }
}
