package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

public class TeamRouteBuilderTest {

	private RunningDinnerCalculator calc = new RunningDinnerCalculator();

	@Test
	public void testCrossedTeams() throws NoPossibleRunningDinnerException {

		List<Participant> participants = ParticipantGenerator.generateParticipants(18);
		RunningDinnerConfig config = Configurations.standardConfig;
		GeneratedTeamsResult generatedTeams = calc.generateTeams(config, participants, Collections.emptyList(), Collections::shuffle);
		calc.assignRandomMealClasses(generatedTeams, config, Collections.emptyList());

		List<Team> teams = generatedTeams.getRegularTeams();
		assertEquals(9, teams.size());
		// sort by team number
		Collections.sort(teams);

		// team1 visits team6 and team9
		Team team1 = teams.get(0);
		Team team6 = teams.get(5);
		Team team9 = teams.get(8);
		team1.addHostTeam(team6);
		team1.addHostTeam(team9);

		// team1 is host for team4 and team7
		Team team4 = teams.get(3);
		Team team7 = teams.get(6);
		team4.addHostTeam(team1);
		team7.addHostTeam(team1);

		// team6 is host for team8 (thus team1 sees also team8)
		Team team8 = teams.get(7);
		team8.addHostTeam(team6);

		// team9 is host for team5 (thus team1 sees also team5)
		Team team5 = teams.get(4);
		team5.addHostTeam(team9);

		Collection<Team> seenTeamsOfTeam1 = TeamRouteBuilder.getAllCrossedTeams(team1);
		assertThat(seenTeamsOfTeam1).containsExactlyInAnyOrder(team4, team7, team6, team8, team9, team5);
		assertThat(seenTeamsOfTeam1).hasSize(6);

		Team team2 = teams.get(1);
		assertThat(seenTeamsOfTeam1).doesNotContain(team2);
		
		Collection<Team> seenTeamsOfTeam4 = TeamRouteBuilder.getAllCrossedTeams(team4);
		assertThat(seenTeamsOfTeam4).containsExactlyInAnyOrder(team1, team7);
		assertThat(seenTeamsOfTeam4).hasSize(2);
	}

}
