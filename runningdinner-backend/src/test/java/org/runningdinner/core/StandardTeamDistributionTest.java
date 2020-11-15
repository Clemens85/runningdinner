package org.runningdinner.core;

import org.junit.Test;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

public class StandardTeamDistributionTest {

	private RunningDinnerCalculator runningDinnerCalculator = new RunningDinnerCalculator();

	@Test
	public void testTeamsWithoutDistributing() throws NoPossibleRunningDinnerException {
		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(18);

		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.standardConfigWithoutDistributing, teamMembers, Collections::shuffle);
		assertEquals(false, teamsResult.hasNotAssignedParticipants());
		assertEquals(9, teamsResult.getRegularTeams().size());

		System.out.println("*** testTeamsWithoutDistributing ***");
		for (Team team : teamsResult.getRegularTeams()) {
			assertEquals(Configurations.standardConfigWithoutDistributing.getTeamSize(), team.getTeamMembers().size());
			System.out.println(team);
		}
	}

	@Test
	public void testTeamsWithBalancedDistributing() throws NoPossibleRunningDinnerException {
		List<Participant> participants = ParticipantGenerator.generateEqualBalancedParticipants(0);

		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.standardConfig, participants, Collections::shuffle);
		assertEquals(false, teamsResult.hasNotAssignedParticipants());
		assertEquals(9, teamsResult.getRegularTeams().size());

		System.out.println("*** testTeamsWithBalancedDistributing ***");
		for (Team team : teamsResult.getRegularTeams()) {

			assertEquals(true, isDistributionBalanced(team, Configurations.standardConfig));

			System.out.println(team + " - canHost: " + team.getHostingCapability(Configurations.standardConfig));
		}
	}

	@Test
	public void testTeamsWithUnbalancedDistributing() throws NoPossibleRunningDinnerException {
		List<Participant> participants = ParticipantGenerator.generateParticipants(18);
		ParticipantGenerator.distributeSeats(participants, 6, 4);

		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.standardConfig, participants, Collections::shuffle);
		assertEquals(false, teamsResult.hasNotAssignedParticipants());
		assertEquals(9, teamsResult.getRegularTeams().size());

		System.out.println("*** testTeamsWithUnbalancedDistributing ***");
		int numBalancedTeams = 0;
		int numUnbalancedTeams = 0;
		for (Team team : teamsResult.getRegularTeams()) {
			if (isDistributionBalanced(team, Configurations.standardConfig)) {
				numBalancedTeams++;
			}
			else {
				numUnbalancedTeams++;
			}

			System.out.println(team + " - canHouse :" + team.getHostingCapability(Configurations.standardConfig));
		}

		assertEquals(4, numBalancedTeams);
		assertEquals(5, numUnbalancedTeams);
	}

	@Test
	public void testNotAssignedTeamMembers() throws NoPossibleRunningDinnerException {
		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(19);
		GeneratedTeamsResult result = runningDinnerCalculator.generateTeams(Configurations.standardConfig, teamMembers, Collections::shuffle);
		assertEquals(true, result.hasNotAssignedParticipants());
		assertEquals(1, result.getNotAssignedParticipants().size());
		assertEquals(9, result.getRegularTeams().size());

		Participant notAssignedMember = result.getNotAssignedParticipants().iterator().next();
		for (Team regularTeam : result.getRegularTeams()) {
			assertEquals(2, regularTeam.getTeamMembers().size());
			assertEquals(false, regularTeam.getTeamMembers().contains(notAssignedMember));
		}
	}

	@Test
	public void testTooFewParticipants() {

		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(5);

		// Assert that all participants are returned again as non assignable:
		List<Participant> notAssignableParticipants = runningDinnerCalculator.calculateNotAssignableParticipants(
				Configurations.standardConfig, teamMembers);
		assertEquals(teamMembers.size(), notAssignableParticipants.size());

		try {
			runningDinnerCalculator.generateTeams(Configurations.standardConfig, teamMembers, Collections::shuffle);
			fail("Expected NoPossibleRunningDinnerException to be thrown");
		}
		catch (NoPossibleRunningDinnerException e) {
			assertTrue(true);
		}
	}

	/**
	 * Assume team with team-size of 2
	 * 
	 * @param team
	 * @return
	 */
	protected boolean isDistributionBalanced(final Team team, final RunningDinnerConfig runningDinnerConfig) {
		Set<Participant> teamMembers = team.getTeamMembers();
		if (teamMembers.size() != 2) {
			throw new IllegalArgumentException("Team " + team + " must have exactly two members, but had " + teamMembers.size());
		}
		Participant[] teamMemberArr = teamMembers.toArray(new Participant[2]);

		FuzzyBoolean canHouse1 = runningDinnerConfig.canHost(teamMemberArr[0]);
		FuzzyBoolean canHouse2 = runningDinnerConfig.canHost(teamMemberArr[1]);

		if (canHouse1 == FuzzyBoolean.UNKNOWN && canHouse2 == FuzzyBoolean.UNKNOWN) {
			return false;
		}

		if (canHouse1 == FuzzyBoolean.TRUE) {
			if (canHouse2 == FuzzyBoolean.FALSE) {
				return true;
			}
		}
		else if (canHouse2 == FuzzyBoolean.TRUE) {
			if (canHouse1 == FuzzyBoolean.FALSE) {
				return true;
			}
		}
		else if (canHouse2 == canHouse1) {
			return false;
		}

		throw new RuntimeException("May never reach here!");
	}

}
