package org.runningdinner.core.dinnerplan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.GeneratedTeamsResult;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamDistributorAccessibility;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

public class AccessibilityDinnerPlanTest {

  private static final RunningDinnerConfig CONFIG = Configurations.standardConfig;

  private static final int HOST = 6;
  private static final int NO_HOST = 4;

  private int participantNr = 0;

  private int teamNr = 0;

  @Test
  public void requiringTeamsVisitOnlyAccessibleHosts() throws NoPossibleRunningDinnerException {

    for (int run = 0; run < 100; run++) {
      // Per meal: 1 requiring team (hosting at own home), 1 accessible team, 1 regular team
      List<Team> teams = newTeamsPerMeal(1, 1, 1);

      StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);

      assertValidDinnerRoutes(teams);
      assertThat(countViolations(teams)).isZero();
    }
  }

  @Test
  public void requiringTeamsVisitOnlyAccessibleHostsForMultipleSegments() throws NoPossibleRunningDinnerException {

    for (int run = 0; run < 50; run++) {
      // 36 teams = 4 segments
      List<Team> teams = newTeamsPerMeal(2, 4, 6);

      StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);

      assertValidDinnerRoutes(teams);
      assertThat(countViolations(teams)).isZero();
    }
  }

  @Test
  public void validDinnerRoutesAreBuiltEvenIfAccessibilityCannotBeSatisfied() throws NoPossibleRunningDinnerException {

    List<Team> teams = new ArrayList<>();
    for (MealClass meal : CONFIG.getMealClasses()) {
      teams.add(newTeam(meal, true, false));
      teams.add(newTeam(meal, false, false));
      teams.add(newTeam(meal, false, false));
    }

    StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);

    assertValidDinnerRoutes(teams);
    assertThat(countViolations(teams)).isEqualTo(6);
  }

  @Test
  public void fullPipelineSatisfiesAccessibility() throws NoPossibleRunningDinnerException {

    RunningDinnerCalculator calculator = new RunningDinnerCalculator();
    for (int run = 0; run < 50; run++) {
      List<Participant> participants = new ArrayList<>();
      for (int i = 0; i < 9; i++) {
        participants.add(newParticipant(HOST, i < 6, false));
        participants.add(newParticipant(NO_HOST, false, i < 3));
      }

      GeneratedTeamsResult result = calculator.generateTeams(CONFIG, participants, Collections.emptyList(), Collections::shuffle);
      calculator.assignRandomMealClasses(result, CONFIG, Collections.emptyList());
      StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(result.getRegularTeams(), CONFIG);

      assertValidDinnerRoutes(result.getRegularTeams());
      assertThat(countViolations(result.getRegularTeams())).isZero();
    }
  }

  @Test
  public void repairsExistingRoutesReproducibly() throws NoPossibleRunningDinnerException {

    List<Team> teams = newTeamsPerMeal(0, 0, 3);
    StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);
    Team requiringTeam = teams.getFirst();
    requiringTeam.getHostTeamMember().setRequiresAccessibleHome(true);
    for (Team team : teams) {
      team.getHostTeamMember().setHomeAccessible(!requiringTeam.getHostTeams().contains(team));
    }
    Map<Team, List<Team>> originalHosts = teams.stream().collect(Collectors.toMap(team -> team, team -> new ArrayList<>(team.getHostTeams())));
    assertThat(countViolations(teams)).isEqualTo(2);

    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);

    assertValidDinnerRoutes(teams);
    assertThat(countViolations(teams)).isZero();
    Map<Team, List<Integer>> repairedRoutes = hostNumbers(teams);

    teams.forEach(Team::removeAllTeamReferences);
    originalHosts.forEach((team, hosts) -> hosts.forEach(team::addHostTeam));
    Collections.reverse(teams);
    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);

    assertThat(hostNumbers(teams)).isEqualTo(repairedRoutes);
    assertValidDinnerRoutes(teams);
  }

  @Test
  public void leavesSatisfiedRoutesAndRoutesWithoutRequirementsUnchanged() throws NoPossibleRunningDinnerException {

    List<Team> teams = newTeamsPerMeal(0, 0, 3);
    StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);
    Map<Team, List<Integer>> originalRoutes = hostNumbers(teams);

    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);
    assertThat(hostNumbers(teams)).isEqualTo(originalRoutes);

    teams.forEach(team -> team.getHostTeamMember().setHomeAccessible(true));
    teams.getFirst().getHostTeamMember().setRequiresAccessibleHome(true);
    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);
    assertThat(hostNumbers(teams)).isEqualTo(originalRoutes);
  }

  @Test
  public void keepsOriginalRoutesWhenRequirementsCannotBeSatisfied() throws NoPossibleRunningDinnerException {

    List<Team> teams = newTeamsPerMeal(0, 0, 3);
    StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(teams, CONFIG);
    teams.getFirst().getTeamMembers().forEach(member -> member.setRequiresAccessibleHome(!member.isHost()));
    Team cancelledTeam = newTeam(CONFIG.getMealClasses().getFirst(), true, false);
    cancelledTeam.setStatus(TeamStatus.CANCELLED);
    teams.add(cancelledTeam);
    Map<Team, List<Integer>> originalRoutes = hostNumbers(teams);

    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);

    assertThat(hostNumbers(teams)).isEqualTo(originalRoutes);
    assertThat(countViolations(teams)).isEqualTo(2);
  }

  @Test
  public void prefersLocalRepairOverEquallyAccessibleDistantRepair() throws NoPossibleRunningDinnerException {

    List<Team> teams = new ArrayList<>();
    for (int neighborhood = 0; neighborhood < 3; neighborhood++) {
      List<Team> localTeams = newTeamsPerMeal(0, 0, 3);
      StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(localTeams, CONFIG);
      for (Team team : localTeams) {
        team.getHostTeamMember().setHomeAccessible(true);
        team.getHostTeamMember().setGeocodingResult(GeocodingResult.newInstance(48 + neighborhood * 0.3, 9,
                GeocodingResult.GeocodingResultType.EXACT));
      }
      teams.addAll(localTeams);
    }
    Team requiringTeam = teams.get(18);
    requiringTeam.getHostTeamMember().setRequiresAccessibleHome(true);
    requiringTeam.getHostTeams().forEach(host -> host.getHostTeamMember().setHomeAccessible(false));
    Map<Team, List<Team>> originalHosts = teams.stream().collect(Collectors.toMap(team -> team, team -> new ArrayList<>(team.getHostTeams())));

    DinnerRouteDraft naiveDraft = draftOf(teams);
    DinnerRouteDistanceScore naiveDistance = new DinnerRouteDistanceScore(naiveDraft, CONFIG);
    new AccessibilityRouteOptimizer(naiveDraft, CONFIG).optimize();
    assertThat(naiveDistance.totalDistance()).isGreaterThan(10_000);

    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);

    assertThat(countViolations(teams)).isZero();
    assertValidDinnerRoutes(teams);
    assertThat(new DinnerRouteDistanceScore(draftOf(teams), CONFIG).totalDistance()).isCloseTo(0, within(0.01));
    Map<Team, List<Integer>> repairedRoutes = hostNumbers(teams);

    teams.forEach(Team::removeAllTeamReferences);
    originalHosts.forEach((team, hosts) -> hosts.forEach(team::addHostTeam));
    Collections.reverse(teams);
    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);
    assertThat(hostNumbers(teams)).isEqualTo(repairedRoutes);
  }

  @Test
  public void shortensRoutesWithoutWorseningImpossibleAccessibilityRequirements() throws NoPossibleRunningDinnerException {

    List<Team> teams = new ArrayList<>();
    for (int neighborhood = 0; neighborhood < 2; neighborhood++) {
      List<Team> localTeams = newTeamsPerMeal(0, 0, 3);
      StaticTemplateDinnerPlanGenerator.generateDinnerExecutionPlan(localTeams, CONFIG);
      for (Team team : localTeams) {
        team.getHostTeamMember().setGeocodingResult(GeocodingResult.newInstance(48 + neighborhood * 0.3, 9,
                GeocodingResult.GeocodingResultType.EXACT));
      }
      teams.addAll(localTeams);
    }
    DinnerRouteDraft disruptedDraft = draftOf(teams);
    disruptedDraft.slots().get(0).swapTeamWith(disruptedDraft.slots().get(9));
    teams.forEach(Team::removeAllTeamReferences);
    disruptedDraft.applyVisits();
    teams.get(1).getTeamMembers().forEach(member -> member.setRequiresAccessibleHome(!member.isHost()));
    assertThat(countViolations(teams)).isEqualTo(2);
    assertThat(new DinnerRouteDistanceScore(draftOf(teams), CONFIG).totalDistance()).isGreaterThan(10_000);

    AccessibilityRouteOptimizer.repairRoutes(teams, CONFIG, 42L);

    assertThat(countViolations(teams)).isEqualTo(2);
    assertValidDinnerRoutes(teams);
    assertThat(new DinnerRouteDistanceScore(draftOf(teams), CONFIG).totalDistance()).isCloseTo(0, within(0.01));
  }

  @Test
  public void scoresJourneysBetweenConsecutiveMealsRatherThanGuestToEveryHost() {

    List<Team> teams = new ArrayList<>();
    for (MealClass meal : CONFIG.getMealClasses()) {
      Team team = newTeam(meal, false, true);
      team.getHostTeamMember().setGeocodingResult(GeocodingResult.newInstance(48 + teams.size() * 0.1, 9,
              GeocodingResult.GeocodingResultType.EXACT));
      teams.add(team);
    }
    teams.getFirst().addHostTeam(teams.get(1));
    teams.getFirst().addHostTeam(teams.get(2));
    double expected = DistanceCalculator.calculateDistanceVincentyInMeters(teams.get(0), teams.get(1))
            + DistanceCalculator.calculateDistanceVincentyInMeters(teams.get(1), teams.get(2));
    Collections.reverse(teams);

    assertThat(new DinnerRouteDistanceScore(draftOf(teams), CONFIG).totalDistance()).isCloseTo(expected, within(0.01));

    teams.getFirst().getHostTeamMember().setGeocodingResult(new GeocodingResult());
    assertThat(new DinnerRouteDistanceScore(draftOf(teams), CONFIG).totalDistance()).isZero();
  }

  private static DinnerRouteDraft draftOf(List<Team> teams) {

    DinnerRouteDraft draft = new DinnerRouteDraft();
    Map<Team, DinnerRouteDraft.Slot> slots = teams.stream()
            .collect(Collectors.toMap(team -> team, team -> draft.addSlot(team, team.getMealClass())));
    for (Team team : teams) {
      team.getHostTeams().forEach(host -> draft.addVisit(slots.get(team), slots.get(host)));
    }
    return draft;
  }

  private static Map<Team, List<Integer>> hostNumbers(List<Team> teams) {

    return teams.stream().collect(Collectors.toMap(team -> team,
            team -> team.getHostTeams().stream().map(Team::getTeamNumber).sorted().toList()));
  }

  private static long countViolations(List<Team> teams) {

    return teams
            .stream()
            .filter(TeamDistributorAccessibility::requiresAccessibleHostLocation)
            .flatMap(t -> t.getHostTeams().stream())
            .filter(hostTeam -> !TeamDistributorAccessibility.hasAccessibleHostLocation(hostTeam, CONFIG))
            .count();
  }

  private static void assertValidDinnerRoutes(List<Team> teams) {

    for (Team team : teams) {
      assertThat(team.getHostTeams()).hasSize(2);
      assertThat(team.getGuestTeams()).hasSize(2);
      assertThat(team.getHostTeams()).doesNotContain(team);
      assertThat(team.getGuestTeams()).doesNotContain(team);
      assertThat(team.getHostTeams()).extracting(Team::getMealClass).doesNotContain(team.getMealClass()).doesNotHaveDuplicates();
      assertThat(team.getGuestTeams()).extracting(Team::getMealClass).doesNotContain(team.getMealClass());
      assertThat(new HashSet<>(TeamRouteBuilder.getAllCrossedTeams(team))).hasSize(6).doesNotContain(team);
    }
  }

  private List<Team> newTeamsPerMeal(int numRequiring, int numAccessible, int numRegular) {

    List<Team> result = new ArrayList<>();
    for (MealClass meal : CONFIG.getMealClasses()) {
      for (int i = 0; i < numRequiring; i++) {
        result.add(newTeam(meal, true, true));
      }
      for (int i = 0; i < numAccessible; i++) {
        result.add(newTeam(meal, false, true));
      }
      for (int i = 0; i < numRegular; i++) {
        result.add(newTeam(meal, false, false));
      }
    }
    return result;
  }

  /**
   * Creates a team whose first member is the host.
   */
  private Team newTeam(MealClass meal, boolean requiresAccessibility, boolean accessibleHostLocation) {

    Participant host = newParticipant(HOST, accessibleHostLocation && !requiresAccessibility, false);
    Participant member = newParticipant(NO_HOST, false, false);
    if (requiresAccessibility && accessibleHostLocation) {
      host.setRequiresAccessibleHome(true);
    } else if (requiresAccessibility) {
      member.setRequiresAccessibleHome(true);
    }
    host.setHost(true);

    Team result = new Team(++teamNr);
    result.setTeamMembers(new HashSet<>(List.of(host, member)));
    result.setMealClass(meal);
    return result;
  }

  private Participant newParticipant(int numSeats, boolean homeAccessible, boolean requiresAccessibleHome) {

    Participant result = ParticipantGenerator.generateParticipant(++participantNr);
    result.setNumSeats(numSeats);
    result.setHomeAccessible(homeAccessible);
    result.setRequiresAccessibleHome(requiresAccessibleHome);
    return result;
  }
}
