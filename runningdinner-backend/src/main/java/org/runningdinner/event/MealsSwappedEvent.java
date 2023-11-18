package org.runningdinner.event;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.springframework.context.ApplicationEvent;

import java.util.Set;

public class MealsSwappedEvent extends ApplicationEvent {
  private Set<Participant> firstTeamMembers;
  private MealClass newMealForFirstTeamMembers;
  private Set<Participant> secondTeamMembers;
  private MealClass newMealForSecondTeamMembers;
  private RunningDinner runningDinner;

  public MealsSwappedEvent(Object source,
                           Set<Participant> firstTeamMembers,
                           MealClass newMealForFirstTeamMembers,
                           Set<Participant> secondTeamMembers,
                           MealClass newMealForSecondTeamMembers,
                           RunningDinner runningDinner) {
    super(source);
    this.firstTeamMembers = firstTeamMembers;
    this.newMealForFirstTeamMembers = newMealForFirstTeamMembers;
    this.secondTeamMembers = secondTeamMembers;
    this.newMealForSecondTeamMembers = newMealForSecondTeamMembers;
    this.runningDinner = runningDinner;
;
  }

  public Set<Participant> getFirstTeamMembers() {
    return firstTeamMembers;
  }

  public MealClass getNewMealForFirstTeamMembers() {
    return newMealForFirstTeamMembers;
  }

  public Set<Participant> getSecondTeamMembers() {
    return secondTeamMembers;
  }

  public MealClass getNewMealForSecondTeamMembers() {
    return newMealForSecondTeamMembers;
  }

  public RunningDinner getRunningDinner() {
    return runningDinner;
  }
}
