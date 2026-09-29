package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

public class TeamDistributorAccessibilityTest {

  private static final int HOST = 6;
  private static final int NO_HOST = 4;

  private int participantNr = 0;

  @Test
  public void requiringParticipantGetsAccessibleHost() {

    Participant requiring = newParticipant(NO_HOST, false, true);
    Team team1 = newTeam(1, requiring, newParticipant(HOST, false, false));
    Team team2 = newTeam(2, newParticipant(HOST, true, false), newParticipant(NO_HOST, false, false));

    List<Team> teams = new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertAllTeamsSatisfied(teams);
    teams.forEach(t -> TeamDistributorHostingTest.assertOneHostOneNoHost(t, Configurations.standardConfig));
  }

  @Test
  public void requiringParticipantWhoCanHostSatisfiesTeamHimself() {

    Participant requiring = newParticipant(HOST, false, true);
    Participant partner = newParticipant(NO_HOST, false, false);
    Team team1 = newTeam(1, requiring, partner);
    Team team2 = newTeam(2, newParticipant(HOST, true, false), newParticipant(NO_HOST, false, false));

    new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertThat(team1.getTeamMembers()).containsExactlyInAnyOrder(requiring, partner);
  }

  @Test
  public void accessibleHomeWithoutEnoughSeatsIsNoAccessibleHostLocation() {

    Participant requiring = newParticipant(NO_HOST, false, true);
    Participant host = newParticipant(HOST, false, false);
    Team team1 = newTeam(1, requiring, host);
    Team team2 = newTeam(2, newParticipant(NO_HOST, true, false), newParticipant(HOST, false, false));

    new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertThat(team1.getTeamMembers()).containsExactlyInAnyOrder(requiring, host);
  }

  @Test
  public void satisfiedTeamIsNeverBroken() {

    Participant requiring1 = newParticipant(NO_HOST, false, true);
    Participant noHost = newParticipant(NO_HOST, false, false);
    Participant accessibleHost = newParticipant(HOST, true, false);
    Participant requiring2 = newParticipant(NO_HOST, false, true);
    Team team1 = newTeam(1, requiring1, noHost);
    Team team2 = newTeam(2, accessibleHost, requiring2);

    new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertThat(team2.getTeamMembers()).containsExactlyInAnyOrder(accessibleHost, requiring2);
  }

  @Test
  public void hostingCapabilityIsNotWorsened() {

    Participant requiring = newParticipant(NO_HOST, false, true);
    Participant noHost = newParticipant(NO_HOST, false, false);
    Participant accessibleHost = newParticipant(HOST, true, false);
    Participant noHost2 = newParticipant(NO_HOST, false, false);
    Team team1 = newTeam(1, requiring, noHost);
    Team team2 = newTeam(2, accessibleHost, noHost2);

    List<Team> teams = new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertAllTeamsSatisfied(teams);
    // Accessible host must stay in team 2, otherwise team 2 would have lost its only host:
    assertThat(team2.getTeamMembers()).contains(accessibleHost, requiring);
  }

  @Test
  public void teamWithTwoRequiringParticipantsIsResolved() {

    Team team1 = newTeam(1, newParticipant(NO_HOST, false, true), newParticipant(NO_HOST, false, true));
    Team team2 = newTeam(2, newParticipant(HOST, true, false), newParticipant(HOST, false, false));
    Team team3 = newTeam(3, newParticipant(HOST, true, false), newParticipant(HOST, false, false));

    List<Team> teams = new TeamDistributorAccessibility(List.of(team1, team2, team3), Configurations.standardConfigWithoutDistributing).calculateTeams();

    assertAllTeamsSatisfied(teams);
  }

  @Test
  public void teamPartnerWishIsNeverTouched() {

    Participant requiring = newParticipant(NO_HOST, false, true);
    Participant partner = newParticipant(HOST, false, false);
    requiring.setTeamPartnerWishEmail(partner.getEmail());
    partner.setTeamPartnerWishEmail(requiring.getEmail());
    requiring.setActivationDate(LocalDateTime.now());
    partner.setActivationDate(LocalDateTime.now());
    Team team1 = newTeam(1, requiring, partner);
    Team team2 = newTeam(2, newParticipant(HOST, true, false), newParticipant(NO_HOST, false, false));

    new TeamDistributorAccessibility(List.of(team1, team2), Configurations.standardConfig).calculateTeams();

    assertThat(team1.getTeamMembers()).containsExactlyInAnyOrder(requiring, partner);
  }

  @Test
  public void hostingParticipantPrefersAccessibleHome() {

    Participant host = newParticipant(HOST, false, false);
    Participant accessibleHost = newParticipant(HOST, true, false);
    Team team = newTeam(1, host, accessibleHost);

    RunningDinnerCalculator.setHostingParticipant(team, Configurations.standardConfig);

    assertThat(accessibleHost.isHost()).isTrue();
    assertThat(host.isHost()).isFalse();
  }

  @Test
  public void hostingParticipantPrefersRequiringParticipantWhoCanHost() {

    Participant host = newParticipant(HOST, false, false);
    Participant requiringHost = newParticipant(HOST, false, true);
    Team team = newTeam(1, host, requiringHost);

    RunningDinnerCalculator.setHostingParticipant(team, Configurations.standardConfig);

    assertThat(requiringHost.isHost()).isTrue();
    assertThat(host.isHost()).isFalse();
  }

  @Test
  public void generatedTeamsSatisfyAccessibilityWithEqualDistribution() throws NoPossibleRunningDinnerException {

    for (int i = 0; i < 50; i++) {
      List<Participant> participants = newParticipants(3, 3);
      List<Team> teams = generateTeams(Configurations.standardConfig, participants);
      assertAllTeamsSatisfied(teams);
      teams.forEach(t -> TeamDistributorHostingTest.assertOneHostOneNoHost(t, Configurations.standardConfig));
      teams.forEach(this::assertHostProvidesAccessibilityIfNeeded);
    }
  }

  @Test
  public void generatedTeamsSatisfyAccessibilityWithMixedGender() throws NoPossibleRunningDinnerException {

    for (int i = 0; i < 50; i++) {
      List<Participant> participants = newParticipants(3, 3);
      ParticipantGenerator.distributeGender(participants, 9, 9);
      List<Team> teams = generateTeams(Configurations.standardConfigWithMixedGender, participants);
      assertAllTeamsSatisfied(teams);
      teams.forEach(this::assertHostProvidesAccessibilityIfNeeded);
    }
  }

  @Test
  public void generatedTeamsSatisfyAccessibilityWithRandomDistribution() throws NoPossibleRunningDinnerException {

    for (int i = 0; i < 50; i++) {
      List<Participant> participants = newParticipants(3, 6);
      List<Team> teams = generateTeams(Configurations.standardConfigWithoutDistributing, participants);
      assertAllTeamsSatisfied(teams);
      teams.forEach(this::assertHostProvidesAccessibilityIfNeeded);
    }
  }

  private List<Team> generateTeams(RunningDinnerConfig config, List<Participant> participants) throws NoPossibleRunningDinnerException {

    GeneratedTeamsResult result = new RunningDinnerCalculator().generateTeams(config, participants, Collections.emptyList(), Collections::shuffle);
    assertThat(result.getNotAssignedParticipants()).isEmpty();
    return result.getRegularTeams();
  }

  /**
   * 18 participants: 9 hosts and 9 non-hosts. The requiring participants are non-hosts, the accessible homes belong to hosts.
   */
  private List<Participant> newParticipants(int numRequiring, int numAccessibleHosts) {

    List<Participant> result = new ArrayList<>();
    for (int i = 0; i < 9; i++) {
      result.add(newParticipant(HOST, i < numAccessibleHosts, false));
      result.add(newParticipant(NO_HOST, false, i < numRequiring));
    }
    return result;
  }

  private void assertAllTeamsSatisfied(List<Team> teams) {

    for (Team team : teams) {
      assertThat(TeamDistributorAccessibility.isAccessibilitySatisfied(team.getTeamMembers(), Configurations.standardConfig))
        .as("Accessibility of team %s", team.toStringDetailed())
        .isTrue();
    }
  }

  private void assertHostProvidesAccessibilityIfNeeded(Team team) {

    if (team.getTeamMembers().stream().anyMatch(Participant::isRequiresAccessibleHome)) {
      assertThat(TeamDistributorAccessibility.canHostAtAccessibleLocation(team.getHostTeamMember(), Configurations.standardConfig)).isTrue();
    }
  }

  private Participant newParticipant(int numSeats, boolean homeAccessible, boolean requiresAccessibleHome) {

    Participant result = ParticipantGenerator.generateParticipant(++participantNr);
    result.setNumSeats(numSeats);
    result.setHomeAccessible(homeAccessible);
    result.setRequiresAccessibleHome(requiresAccessibleHome);
    return result;
  }

  private static Team newTeam(int teamNumber, Participant member1, Participant member2) {

    Team result = new Team(teamNumber);
    result.setTeamMembers(new HashSet<>(List.of(member1, member2)));
    return result;
  }
}
