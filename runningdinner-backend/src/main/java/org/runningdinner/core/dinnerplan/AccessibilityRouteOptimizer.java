package org.runningdinner.core.dinnerplan;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.Set;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.TeamDistributorAccessibility;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Re-arranges teams among the slots of an existing route graph so that teams requiring accessibility
 * preferably visit hosts with an accessible location.<br>
 * Teams are only swapped between slots of the same meal, which keeps the structural rules of the routes intact.
 * If no arrangement without violations can be found, the best arrangement found is kept.
 */
public final class AccessibilityRouteOptimizer {

  private static final Logger LOGGER = LoggerFactory.getLogger(AccessibilityRouteOptimizer.class);

  private static final int MAX_RESTARTS = 20;

  private final DinnerRouteDraft routeDraft;

  private final Random random;

  private final List<List<DinnerRouteDraft.Visit>> visitsBySlot;

  private final Map<Team, Boolean> requiresAccessibility = new HashMap<>();

  private final Map<Team, Boolean> accessibleHostLocation = new HashMap<>();

  /**
   * @param routeDraft The draft route, whose team assignments will be optimized in place
   */
  AccessibilityRouteOptimizer(DinnerRouteDraft routeDraft, RunningDinnerConfig configuration) {

    this(routeDraft, configuration, new Random());
  }

  private AccessibilityRouteOptimizer(DinnerRouteDraft routeDraft, RunningDinnerConfig configuration, Random random) {

    this.routeDraft = routeDraft;
    this.random = random;

    this.visitsBySlot = new ArrayList<>(routeDraft.size());
    for (int i = 0; i < routeDraft.size(); i++) {
      visitsBySlot.add(new ArrayList<>());
    }
    for (DinnerRouteDraft.Visit visit : routeDraft.visits()) {
      visitsBySlot.get(visit.guest().number()).add(visit);
      visitsBySlot.get(visit.host().number()).add(visit);
    }

    for (DinnerRouteDraft.Slot slot : routeDraft.slots()) {
      Team team = slot.team();
      requiresAccessibility.put(team, TeamDistributorAccessibility.requiresAccessibleHostLocation(team));
      accessibleHostLocation.put(team, TeamDistributorAccessibility.hasAccessibleHostLocation(team, configuration));
    }
  }

  public static void repairRoutes(List<Team> teams, RunningDinnerConfig configuration, long seed) {

    List<Team> activeTeams = teams.stream()
            .filter(team -> team.getStatus() != TeamStatus.CANCELLED)
            .sorted(Comparator.comparingInt(Team::getTeamNumber))
            .toList();
    if (activeTeams.stream().noneMatch(TeamDistributorAccessibility::requiresAccessibleHostLocation)) {
      return;
    }

    DinnerRouteDraft draft = new DinnerRouteDraft();
    Map<Team, DinnerRouteDraft.Slot> slotsByTeam = new HashMap<>();
    activeTeams.forEach(team -> slotsByTeam.put(team, draft.addSlot(team, team.getMealClass())));
    for (Team team : activeTeams) {
      for (Team host : team.getHostTeams()) {
        if (host.getStatus() != TeamStatus.CANCELLED) {
          draft.addVisit(slotsByTeam.get(team), Objects.requireNonNull(slotsByTeam.get(host), "Host team missing from routes"));
        }
      }
    }

    AccessibilityRouteOptimizer optimizer = new AccessibilityRouteOptimizer(draft, configuration, new Random(seed));
    int initialViolations = optimizer.countViolations();
    if (initialViolations == 0) {
      return;
    }
    optimizer.optimize();
    if (optimizer.countViolations() < initialViolations) {
      teams.forEach(Team::removeAllTeamReferences);
      draft.applyVisits();
    }
  }

  void optimize() {

    if (!requiresAccessibility.containsValue(Boolean.TRUE)) {
      return;
    }

    int initialViolations = countViolations();
    if (initialViolations == 0) {
      return;
    }
    hillClimb();
    List<Team> bestArrangement = currentArrangement();
    int bestViolations = countViolations();

    for (int restart = 0; restart < MAX_RESTARTS && bestViolations > 0; restart++) {
      shuffleWithinMeals();
      hillClimb();
      int violations = countViolations();
      if (violations < bestViolations) {
        bestViolations = violations;
        bestArrangement = currentArrangement();
      }
    }

    for (int i = 0; i < bestArrangement.size(); i++) {
      routeDraft.slots().get(i).setTeam(bestArrangement.get(i));
    }
    LOGGER.info("Optimized dinner routes for accessibility: {} violations before, {} violations after", initialViolations, bestViolations);
  }

  private void hillClimb() {

    boolean improved = true;
    while (improved && countViolations() > 0) {
      improved = false;
      List<DinnerRouteDraft.Slot> slots = routeDraft.slots();
      for (int a = 0; a < slots.size(); a++) {
        for (int b = a + 1; b < slots.size(); b++) {
          DinnerRouteDraft.Slot firstSlot = slots.get(a);
          DinnerRouteDraft.Slot secondSlot = slots.get(b);
          if (!Objects.equals(firstSlot.meal(), secondSlot.meal()) || hasSameAccessibilityProfile(firstSlot.team(), secondSlot.team())) {
            continue;
          }
          int before = countViolationsAround(a, b);
          firstSlot.swapTeamWith(secondSlot);
          if (countViolationsAround(a, b) < before) {
            improved = true;
          } else {
            firstSlot.swapTeamWith(secondSlot);
          }
        }
      }
    }
  }

  private void shuffleWithinMeals() {

    Map<MealClass, List<Integer>> slotsByMeal = new LinkedHashMap<>();
    for (DinnerRouteDraft.Slot slot : routeDraft.slots()) {
      slotsByMeal.computeIfAbsent(slot.meal(), meal -> new ArrayList<>()).add(slot.number());
    }
    for (List<Integer> slotNumbers : slotsByMeal.values()) {
      List<Team> teams = new ArrayList<>(slotNumbers.stream().map(number -> routeDraft.slots().get(number).team()).toList());
      Collections.shuffle(teams, random);
      for (int i = 0; i < slotNumbers.size(); i++) {
        routeDraft.slots().get(slotNumbers.get(i)).setTeam(teams.get(i));
      }
    }
  }

  private boolean hasSameAccessibilityProfile(Team a, Team b) {

    return requiresAccessibility.get(a).equals(requiresAccessibility.get(b)) &&
           accessibleHostLocation.get(a).equals(accessibleHostLocation.get(b));
  }

  int countViolations() {

    return (int) routeDraft.visits().stream().filter(this::isViolation).count();
  }

  private int countViolationsAround(int slotA, int slotB) {

    Set<DinnerRouteDraft.Visit> affectedVisits = new HashSet<>();
    affectedVisits.addAll(visitsBySlot.get(slotA));
    affectedVisits.addAll(visitsBySlot.get(slotB));
    return (int) affectedVisits.stream().filter(this::isViolation).count();
  }

  private boolean isViolation(DinnerRouteDraft.Visit visit) {

    return requiresAccessibility.get(visit.guest().team()) && !accessibleHostLocation.get(visit.host().team());
  }

  private List<Team> currentArrangement() {

    return routeDraft.slots().stream().map(DinnerRouteDraft.Slot::team).toList();
  }
}
