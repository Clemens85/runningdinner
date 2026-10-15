package org.runningdinner.core.dinnerplan;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.core.MealClass;
import org.runningdinner.participant.Team;

final class DinnerRouteDraft {

  private final List<Slot> slots = new ArrayList<>();

  private final List<Visit> visits = new ArrayList<>();

  Slot addSlot(Team team, MealClass meal) {

    Slot result = new Slot(slots.size(), team, meal);
    slots.add(result);
    return result;
  }

  void addVisit(Slot guestSlot, Slot hostSlot) {

    visits.add(new Visit(guestSlot, hostSlot));
  }

  List<Slot> slots() {

    return slots;
  }

  List<Visit> visits() {

    return visits;
  }

  int size() {

    return slots.size();
  }

  void applyVisits() {

    for (Visit visit : visits) {
      visit.guest().team().addHostTeam(visit.host().team());
    }
  }

  static final class Slot {

    private final int number;

    private final MealClass meal;

    private Team team;

    private Slot(int number, Team team, MealClass meal) {
      this.number = number;
      this.team = team;
      this.meal = meal;
    }

    int number() {
      return number;
    }

    MealClass meal() {
      return meal;
    }

    Team team() {
      return team;
    }

    void setTeam(Team team) {
      this.team = team;
    }

    void swapTeamWith(Slot other) {
      if (!meal.equals(other.meal)) {
        throw new IllegalArgumentException("Teams can only be swapped between slots for the same meal");
      }
      Team currentTeam = team;
      team = other.team;
      other.team = currentTeam;
    }
  }

  record Visit(Slot guest, Slot host) {
  }
}