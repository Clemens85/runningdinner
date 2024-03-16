package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

public class TeamDistributorHostingTest {

  @Test
  public void testHostingDistributionAllHaveNotEnoughSeats() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(4);
    ParticipantGenerator.distributeSeats(participants, 6, 0);
    
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfig);
    List<Team> teams = hostingDistributor.calculateTeams();
    assertThat(teams).hasSize(2);
    
    for (Team team : teams) {
      assertNoHost(team, Configurations.standardConfig);
    }
  }
  
  @Test
  public void testHostingDistributionAllHaveEnoughSeats() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(8);
    ParticipantGenerator.distributeSeats(participants, 6, 8);
    
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfig);
    List<Team> teams = hostingDistributor.calculateTeams();
    assertThat(teams).hasSize(4);
    
    for (Team team : teams) {
      assertAllHost(team, Configurations.standardConfig);
    }
  }
  
  @Test
  public void testHostingDistributionEquallyMixed() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(8);
    ParticipantGenerator.distributeSeats(participants, 6, 4);
    
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfig);
    List<Team> teams = hostingDistributor.calculateTeams();
    assertThat(teams).hasSize(4);
    
    for (Team team : teams) {
      assertOneHostOneNoHost(team, Configurations.standardConfig);
    }
  }
  
  @Test
  public void testHostingDistributionAllUnknown() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(4);
    
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfig);
    List<Team> teams = hostingDistributor.calculateTeams();
    assertThat(teams).hasSize(2);
    
    for (Team team : teams) {
      assertAllUnknownHost(team, Configurations.standardConfig);
    }
  }
  
  @Test
  public void testHostingDistributionAllKinds() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(8);
    
    // Mix between Can host, Can Not Host, and unknown hosting
    for (Participant participant : participants) {
      participant.setNumSeats(6);
    }
    participants.get(0).setNumSeats(1);
    participants.get(1).setNumSeats(1);
    participants.get(5).setNumSeats(Participant.UNDEFINED_SEATS);
    participants.get(7).setNumSeats(Participant.UNDEFINED_SEATS);
    participants.get(3).setNumSeats(Participant.UNDEFINED_SEATS);
    
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfig);
    List<Team> teams = hostingDistributor.calculateTeams();
    assertThat(teams).hasSize(4);

    List<Team> result = findTeamsWithGoodHostingCapability(teams, Configurations.standardConfig);
    assertThat(result).hasSize(3);
    result = findTeamsWithUnknownHostingCapability(teams, Configurations.standardConfig);
    assertThat(result).hasSize(1);
  }
  
  @Test
  public void testHostingDistributionRandom() {
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(8);
    ParticipantGenerator.distributeSeats(participants, 6, 4);
    
    // Just test that this also works:
    TeamDistributorHosting hostingDistributor = new TeamDistributorHosting(participants, Configurations.standardConfigWithoutDistributing);
    assertThat(hostingDistributor.calculateTeams()).hasSize(4);
  }
  
	static List<Team> findTeamsWithUnknownHostingCapability(List<Team> teams, RunningDinnerConfig configuration) {

    return teams
            .stream()
            .filter(t -> !t.getHostingCapability(configuration).contains(FuzzyBoolean.TRUE))
            .filter(t -> t.getHostingCapability(configuration).contains(FuzzyBoolean.UNKNOWN))
            .collect(Collectors.toList());
  }

  static List<Team> findTeamsWithGoodHostingCapability(List<Team> teams, RunningDinnerConfig configuration) {

	  return teams
	          .stream()
	          .filter(t -> t.getHostingCapability(configuration).contains(FuzzyBoolean.TRUE))
	          .collect(Collectors.toList());
  }

  static void assertAllUnknownHost(Team team, RunningDinnerConfig configuration) {

    List<FuzzyBoolean> hostingCapabilities = team.getHostingCapability(configuration);
    assertThat(hostingCapabilities).containsExactlyInAnyOrder(FuzzyBoolean.UNKNOWN, FuzzyBoolean.UNKNOWN);
  }

  static void assertOneHostOneNoHost(Team team, RunningDinnerConfig configuration) {

    List<FuzzyBoolean> hostingCapabilities = team.getHostingCapability(configuration);
    assertThat(hostingCapabilities).as("Team " + team + " did not match one-host one-no-host").containsExactlyInAnyOrder(FuzzyBoolean.TRUE, FuzzyBoolean.FALSE);
  }

  static void assertNoHost(Team team, RunningDinnerConfig configuration) {

	  List<FuzzyBoolean> hostingCapabilities = team.getHostingCapability(configuration);
	  assertThat(hostingCapabilities).containsExactlyInAnyOrder(FuzzyBoolean.FALSE, FuzzyBoolean.FALSE);
  }
	
  static void assertAllHost(Team team, RunningDinnerConfig configuration) {

    List<FuzzyBoolean> hostingCapabilities = team.getHostingCapability(configuration);
    assertThat(hostingCapabilities).containsExactlyInAnyOrder(FuzzyBoolean.TRUE, FuzzyBoolean.TRUE);
  }

//  @Test
//	public void testMixedGenderDistributionOnly() {
//	  
//	  
//	  
//		List<Participant> participants = ParticipantGenerator.generateParticipants(8);
//		ParticipantGenerator.distributeGender(participants, 3, 5);
//
//		assertEquals(3, getNumParticipantsWithGender(participants, Gender.MALE));
//		assertEquals(5, getNumParticipantsWithGender(participants, Gender.FEMALE));
//
//		TeamDistributor teamDistributor = new TeamDistributor(participants);
//		teamDistributor.distribute(getConfig(GenderAspect.FORCE_GENDER_MIX));
//		Queue<Participant> categoryOneList = teamDistributor.getCategoryOneList();
//		Queue<Participant> categoryTwoList = teamDistributor.getCategoryTwoList();
//
//		// assertEquals(4, categoryOneList.size());
//		// assertEquals(5, categoryTwoList.size());
//		assertEquals(8, categoryOneList.size() + categoryTwoList.size());
//
//		// The first 3 participants in each list have mixed genders
//		for (int i = 0; i < 3; i++) {
//			Participant p1 = categoryOneList.poll();
//			Participant p2 = categoryTwoList.poll();
//			assertEquals(false, p1.getGender().equals(p2.getGender()));
//		}
//	}
//
//	@Test
//	public void testSameGenderDistributionOnly() {
//
//		List<Participant> participants = ParticipantGenerator.generateParticipants(8);
//		ParticipantGenerator.distributeGender(participants, 3, 5);
//
//		TeamDistributor teamDistributor = new TeamDistributor(participants);
//		teamDistributor.distribute(getConfig(GenderAspect.FORCE_SAME_GENDER));
//		Queue<Participant> categoryOneList = teamDistributor.getCategoryOneList();
//		Queue<Participant> categoryTwoList = teamDistributor.getCategoryTwoList();
//
//		assertEquals(8, categoryOneList.size() + categoryTwoList.size());
//
//		int sameGenderCount = 0;
//		while (true) {
//			Participant p1 = categoryOneList.poll();
//			Participant p2 = categoryTwoList.poll();
//			if (p1 == null && p2 == null) {
//				break;
//			}
//			if (p1 == null || p2 == null) {
//				continue;
//			}
//
//			boolean sameGender = p1.getGender().equals(p2.getGender());
//			if (sameGender) {
//				sameGenderCount++;
//			}
//		}
//
//		// 3 males and 5 females => we should have 3 same gender "teams"
//		assertEquals("Expected 3 same gender teams", 3, sameGenderCount);
//	}
//
//	@Test
//	public void testCapacityWithMixedGenderDistribution() {
//		// Generate 10 participants which contain 6 participants that have enough seats
//		List<Participant> participants = ParticipantGenerator.generateParticipants(10);
//		ParticipantGenerator.distributeSeats(participants, 6, 6);
//
//		// Ensure that we have 6 participants with at least 6 seats:
//		assertThat(participants)
//		  .filteredOn(p -> p.getNumSeats() >= 6)
//		  .hasSize(6);
//		
//		RunningDinnerConfig config = getConfig(true, GenderAspect.FORCE_GENDER_MIX);
//
//		// Now we have 6 hosting participants, 4 non-hosting participants
//
//		int cnt = 0;
//		int numFemalesOnNonHostingParticipants = 0;
//		for (Participant p : participants) {
//			// 3 males, 3 females:
//			if (FuzzyBoolean.TRUE == config.canHost(p)) {
//				p.setGender(cnt % 2 == 0 ? Gender.MALE : Gender.FEMALE);
//				cnt++;
//			}
//			else {
//				// Set three non-hosting participants to female, one to male:
//				if (numFemalesOnNonHostingParticipants++ < 3) {
//					p.setGender(Gender.FEMALE);
//				}
//				else {
//					p.setGender(Gender.MALE);
//				}
//			}
//		}
//
//		// Add a little bit randomness:
//		Collections.shuffle(participants);
//
//		assertThat(participants)
//		  .filteredOn(p -> p.getGender() == Gender.MALE)
//		  .hasSize(4);
//		
//    assertThat(participants)
//    .filteredOn(p -> p.getGender() == Gender.FEMALE)
//    .hasSize(6);
//		
//
//		TeamDistributor teamDistributor = new TeamDistributor(participants);
//		teamDistributor.distribute(config);
//
//		// 6 hosting participants (3 males, 3 females), and 4 non hosting participants (3 females, 1 male):
//		// This should give us 3 perfect teams with both criterias met up and, 1 team with the mixed gender condition met up, and 1 team
//		// with two females:
//		Queue<Participant> categoryOneList = teamDistributor.getCategoryOneList();
//		Queue<Participant> categoryTwoList = teamDistributor.getCategoryTwoList();
//
//		int numPerfectTeams = 0;
//		int numMixedGenderTeams = 0;
//		int numGoodHostingDistributionTeams = 0;
//
//		StringBuilder teamsDump = new StringBuilder();
//
//		while (true) {
//			Participant p1 = categoryOneList.poll();
//			Participant p2 = categoryTwoList.poll();
//			if (p1 == null && p2 == null) {
//				break;
//			}
//
//			if (p1 == null || p2 == null) {
//				continue;
//			}
//
//			teamsDump.append(p1.getParticipantNumber()).append(" (").append(p1.getGender()).append(", ").append(p1.getNumSeats()).append(
//					") <-> ");
//			teamsDump.append(p2.getParticipantNumber()).append(" (").append(p2.getGender()).append(", ").append(p2.getNumSeats()).append(
//					")");
//			teamsDump.append("\r\n");
//
//			boolean mixedGender = p1.getGender() != p2.getGender();
//			boolean canHost = config.canHost(p1) == FuzzyBoolean.TRUE || config.canHost(p2) == FuzzyBoolean.TRUE;
//
//			if (mixedGender && canHost) {
//				numPerfectTeams++;
//				continue;
//			}
//
//			if (mixedGender) {
//				numMixedGenderTeams++;
//				continue;
//			}
//
//			if (canHost) {
//				numGoodHostingDistributionTeams++;
//			}
//		}
//
//		System.out.println(teamsDump);
//
//		assertEquals("Expected alltogehter 5 teams", 5, numPerfectTeams + numGoodHostingDistributionTeams + numMixedGenderTeams);
//		assertEquals("Expected 4 perfect teams (distribution and gender mixed)", 4, numPerfectTeams);
//		assertEquals("Expected 1 team that has at least a correct hosting distribution ", 1, numGoodHostingDistributionTeams);
//		assertEquals("Expected 0 teams with only mixed gender distribution ", 0, numMixedGenderTeams);
//
//	}
//
//	protected RunningDinnerConfig getConfig(GenderAspect genderAspect) {
//		RunningDinnerConfig config = RunningDinnerConfig.newConfigurer().withGenderAspects(genderAspect).havingMeals(
//				Arrays.asList(MealClass.MAINCOURSE(), MealClass.APPETIZER(), MealClass.DESSERT())).withTeamSize(2).build();
//		return config;
//	}
//
//	protected RunningDinnerConfig getConfig(boolean forceEqualDistributedTeams, GenderAspect genderAspect) {
//		RunningDinnerConfig config = RunningDinnerConfig.newConfigurer().withGenderAspects(genderAspect).havingMeals(
//				Arrays.asList(MealClass.MAINCOURSE(), MealClass.APPETIZER(), MealClass.DESSERT())).withTeamSize(2).withEqualDistributedCapacityTeams(
//				forceEqualDistributedTeams).build();
//		return config;
//	}
//
//	protected int getNumParticipantsWithGender(Collection<Participant> participants, Gender gender) {
//		int result = 0;
//		for (Participant p : participants) {
//			if (p.getGender().equals(gender)) {
//				result++;
//			}
//		}
//		return result;
//	}
}
