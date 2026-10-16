package org.runningdinner.core.dinnerplan;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.participant.Team;

final class DinnerRouteDistanceScore {

  private final Map<Team, Integer> teamIndices = new HashMap<>();

  private final double[][] distances;

  private final List<List<DinnerRouteDraft.Slot>> routes = new ArrayList<>();

  private final boolean completeDistances;

  DinnerRouteDistanceScore(DinnerRouteDraft draft, RunningDinnerConfig configuration) {

    List<DinnerRouteDraft.Slot> slots = draft.slots();
    distances = new double[slots.size()][slots.size()];
    for (DinnerRouteDraft.Slot slot : slots) {
      teamIndices.put(slot.team(), slot.number());
      routes.add(new ArrayList<>(List.of(slot)));
    }
    for (DinnerRouteDraft.Visit visit : draft.visits()) {
      routes.get(visit.guest().number()).add(visit.host());
    }
    List<MealClass> meals = new ArrayList<>(configuration.getMealClasses());
    meals.sort(Comparator.comparing(MealClass::getTime, Comparator.nullsLast(Comparator.naturalOrder())));
    routes.forEach(route -> route.sort(Comparator.comparingInt(slot -> meals.indexOf(slot.meal()))));

    boolean complete = true;
    for (int first = 0; first < slots.size(); first++) {
      for (int second = first + 1; second < slots.size(); second++) {
        double distance = DistanceCalculator.calculateDistanceVincentyInMeters(slots.get(first).team(), slots.get(second).team());
        complete &= Double.isFinite(distance) && distance >= 0;
        distances[first][second] = distances[second][first] = distance;
      }
    }
    completeDistances = complete;
  }

  double totalDistance() {

    if (!completeDistances) {
      return 0;
    }
    double total = 0;
    for (List<DinnerRouteDraft.Slot> route : routes) {
      for (int stop = 1; stop < route.size(); stop++) {
        total += distances[teamIndices.get(route.get(stop - 1).team())][teamIndices.get(route.get(stop).team())];
      }
    }
    return total;
  }
}