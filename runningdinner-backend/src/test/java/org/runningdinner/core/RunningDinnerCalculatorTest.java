package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;
import org.junit.Test;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.test.util.TestUtil;

public class RunningDinnerCalculatorTest {

	private RunningDinnerCalculator runningDinnerCalculator = new RunningDinnerCalculator();

	private static final List<TeamTO> NO_TEAMS_TO_KEEP = Collections.emptyList(); 
	
	@Test
	public void testInvalidConditionWithDefaults() {
		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(2);
		try {
			runningDinnerCalculator.generateTeams(Configurations.standardConfig, teamMembers, NO_TEAMS_TO_KEEP, Collections::shuffle);
			fail("Should never reach here, because Exception should be thrown!");
		}
		catch (NoPossibleRunningDinnerException e) {
			assertTrue(true);
		}
	}

	@Test
	public void testCustomConfigTeamBuilding() throws NoPossibleRunningDinnerException {
		List<Participant> teamMembers = ParticipantGenerator.generateParticipants(13);
		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.customConfig, teamMembers, NO_TEAMS_TO_KEEP, Collections::shuffle);
		assertEquals(true, teamsResult.hasNotAssignedParticipants());
		assertEquals(1, teamsResult.getNotAssignedParticipants().size());
		assertEquals(13, teamsResult.getNotAssignedParticipants().get(0).getParticipantNumber()); // Ensure that last user is the one not
																									// assigned
		assertEquals(6, teamsResult.getRegularTeams().size());

		System.out.println("*** testCustomConfigTeamBuilding ***");
		for (Team team : teamsResult.getRegularTeams()) {
			assertEquals(Configurations.customConfig.getTeamSize(), team.getTeamMembers().size());
			System.out.println(team);
		}
	}

	@Test
	public void testRandomMealClasses() throws NoPossibleRunningDinnerException {
		List<Participant> particiapnts = ParticipantGenerator.generateParticipants(18);
		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.standardConfig, particiapnts, NO_TEAMS_TO_KEEP, Collections::shuffle);
		List<Team> teams = teamsResult.getRegularTeams();
		assertEquals(9, teams.size());

		for (Team team : teams) {
			assertEquals(null, team.getMealClass());
		}

		runningDinnerCalculator.assignRandomMealClasses(teamsResult, Configurations.standardConfig.getMealClasses(), NO_TEAMS_TO_KEEP);

		assertEquals(3, CollectionUtils.countMatches(teams, obj -> {
      Team team = obj;
      return team.getMealClass().equals(MealClass.APPETIZER());
    }));

		assertEquals(3, CollectionUtils.countMatches(teams, obj -> {
      Team team = obj;
      return team.getMealClass().equals(MealClass.MAINCOURSE());
    }));

		assertEquals(3, CollectionUtils.countMatches(teams, obj -> {
      Team team = obj;
      return team.getMealClass().equals(MealClass.DESSERT());
    }));

		final MealClass dummy = new MealClass("dummy");
		assertEquals(0, CollectionUtils.countMatches(teams, obj -> {
      Team team = obj;
      return team.getMealClass().equals(dummy);
    }));
	}

	@Test
	public void testInvalidRandomMealClasses() {
		Team team1 = new Team(1);
		Team team2 = new Team(2);
		ArrayList<Team> teamList = new ArrayList<>(2);
		teamList.add(team1);
		teamList.add(team2);

		GeneratedTeamsResult generatedTeamsResult = new GeneratedTeamsResult();
		generatedTeamsResult.setRegularTeams(teamList);
		try {
			runningDinnerCalculator.assignRandomMealClasses(generatedTeamsResult, Configurations.standardConfig.getMealClasses(), NO_TEAMS_TO_KEEP);
			fail("Should never reach here, because Exception should be thrown!");
		}
		catch (NoPossibleRunningDinnerException e) {
			assertTrue(true);
		}
	}

	@Test
	public void testBuildSingleVisitationPlan() throws NoPossibleRunningDinnerException {
		List<Participant> participants = ParticipantGenerator.generateEqualBalancedParticipants(0);
		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(Configurations.standardConfig, participants, NO_TEAMS_TO_KEEP, Collections::shuffle);

		assertEquals(false, teamsResult.hasNotAssignedParticipants());
		assertEquals(9, teamsResult.getRegularTeams().size());

		runningDinnerCalculator.assignRandomMealClasses(teamsResult, Configurations.standardConfig.getMealClasses(), NO_TEAMS_TO_KEEP);

		runningDinnerCalculator.generateDinnerExecutionPlan(teamsResult, Configurations.standardConfig);

		List<Team> teams = teamsResult.getRegularTeams();
		for (Team team : teams) {
			assertEquals(2, team.getNumberOfGuests());
			assertEquals(2, team.getNumberOfHosts());
			// assertEquals(team, team.getVisitationPlan().getDestTeam());
			assertEquals(false, team.getGuestTeams().contains(team));
			assertEquals(false, team.getHostTeams().contains(team));

			Set<Team> guestTeams = team.getGuestTeams();
			checkMealClassNotContained(team, guestTeams);
			Set<Team> hostTeams = team.getHostTeams();
			checkMealClassNotContained(team, hostTeams);
		}
	}

	@Test
	public void testBuildMultipleVisitationPlans() throws NoPossibleRunningDinnerException {	
		createAndCheckDinnerplans(54);
	}

	@Test
	public void testBuildVisitationPlansWith21Teams() throws NoPossibleRunningDinnerException {

		int numberOfTeams = 21;
		createAndCheckDinnerplans(numberOfTeams);
	}

	
	@Test
	public void testBuildVisitationPlanWith15Teams() throws NoPossibleRunningDinnerException {
		createAndCheckDinnerplans(15);
	}
	
	@Test
	public void testBuildVisitationPlanWith12Teams() throws NoPossibleRunningDinnerException {
		createAndCheckDinnerplans(12);
	}
	
	@Test
	public void testBuildVisitationPlansWith33Teams() throws NoPossibleRunningDinnerException {
		int numberOfTeams = 33;
		createAndCheckDinnerplans(numberOfTeams);
	}
	
	@Test
  public void testTeamPartnerWishesAreAppliedForEqualDistribution() throws NoPossibleRunningDinnerException {
    
	  generateTeamsForConfigAndAssertAppliedTeamPartnerWishes(Configurations.standardConfig);
  }
	
	@Test
	public void testTeamPartnerWishesAreAppliedForEqualDistributionWithGenderMix() throws NoPossibleRunningDinnerException {
	  
	  generateTeamsForConfigAndAssertAppliedTeamPartnerWishes(Configurations.standardConfigWithMixedGender);
	}
	
	@Test
  public void testTeamPartnerWishesAreAppliedRandomConfig() throws NoPossibleRunningDinnerException {
    
    generateTeamsForConfigAndAssertAppliedTeamPartnerWishes(Configurations.standardConfigWithoutDistributing);
  }
	    
	private void generateTeamsForConfigAndAssertAppliedTeamPartnerWishes(RunningDinnerConfig config) throws NoPossibleRunningDinnerException {
	  
	  List<Participant> participants = ParticipantGenerator.generateEqualBalancedParticipants(0);
    TestUtil.setMatchingTeamPartnerWish(participants, 0, 1, "max@mustermann.de", "maria@musterfrau.de", true);
    TestUtil.setMatchingTeamPartnerWish(participants, 8, 12, "foo@bar.de", "bar@foo.de", true);
    
    GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(config, participants, NO_TEAMS_TO_KEEP, Collections::shuffle);
    assertEquals(false, teamsResult.hasNotAssignedParticipants());
    assertEquals(9, teamsResult.getRegularTeams().size());

    List<Team> teams = teamsResult.getRegularTeams();
    
    Team team = TestUtil.findTeamByTeamMemberEmail(teams, "max@mustermann.de");
    assertThat(team.getTeamMembersOrdered()).extracting("email").containsExactlyInAnyOrder("max@mustermann.de", "maria@musterfrau.de");
    team = TestUtil.findTeamByTeamMemberEmail(teams, "foo@bar.de");
    assertThat(team.getTeamMembersOrdered()).extracting("email").containsExactlyInAnyOrder("foo@bar.de", "bar@foo.de");
	}
	
	private void createAndCheckDinnerplans(int numberOfTeams) throws NoPossibleRunningDinnerException {
		List<Participant> participants = ParticipantGenerator.generateParticipants(numberOfTeams * 2);
		ParticipantGenerator.distributeSeatsEqualBalanced(participants, 6);

		RunningDinnerConfig config = RunningDinnerConfig.newConfigurer().withEqualDistributedCapacityTeams(true).withTeamSize(2).withGenderAspects(
				GenderAspect.FORCE_GENDER_MIX).build();
		GeneratedTeamsResult teamsResult = runningDinnerCalculator.generateTeams(config, participants, NO_TEAMS_TO_KEEP, Collections::shuffle);
		assertEquals(false, teamsResult.hasNotAssignedParticipants());
		assertEquals(numberOfTeams, teamsResult.getRegularTeams().size());

		runningDinnerCalculator.assignRandomMealClasses(teamsResult, config.getMealClasses(), NO_TEAMS_TO_KEEP);
		runningDinnerCalculator.generateDinnerExecutionPlan(teamsResult, config);
		List<Team> teams = teamsResult.getRegularTeams();

		for (Team team : teams) {
			// Ensure that every team visit two guest teams and that every team is hoster for 2 other teams.
			assertEquals(2, team.getNumberOfGuests());
			assertEquals(2, team.getNumberOfHosts());

			RunningDinnerCalculatorTest.assertDisjunctTeams(team.getHostTeams(),
					team.getGuestTeams(), team);

			Set<Team> guestTeams = team.getGuestTeams();
			checkMealClassNotContained(team, guestTeams);
			Set<Team> hostTeams = team.getHostTeams();
			checkMealClassNotContained(team, hostTeams);

			Collection<Team> crossedTeams = TeamRouteBuilder.getAllCrossedTeams(team);
			// Expect that this team sees 6 other teams (no dublettes)
			assertThat(new HashSet<>(crossedTeams)).as(team + " should contain 6 teams, but there were only " + crossedTeams).hasSize(6);
			// This team must not occur in the crossed teams
			assertThat(crossedTeams).doesNotContain(team);
		}
	}
	
	
	/**
	 * Asserts that the mealclass of the passed team is not contained in the mealclasses of the passed teamsToCheck
	 *
	 */
	private void checkMealClassNotContained(Team team, Set<Team> teamsToCheck) {
		MealClass referenceMealClass = team.getMealClass();

		for (Team teamToCheck : teamsToCheck) {
			assertFalse(referenceMealClass.equals(teamToCheck.getMealClass()));
		}
	}

	/**
	 * Assert that passed teamToTest does not occur in the passed hostTeams and guestTeams
	 * 
	 */
	public static void assertDisjunctTeams(Set<Team> hostTeams, Set<Team> guestTeams, Team teamToTest) {
		Set<Team> testSet = new HashSet<>();
		testSet.addAll(hostTeams);
		testSet.addAll(guestTeams);
		testSet.add(teamToTest);
		assertEquals("There exist at least one team duplicate in test-set for visitation-plan of team " + teamToTest, hostTeams.size()
				+ guestTeams.size() + 1, testSet.size());
	}

}
