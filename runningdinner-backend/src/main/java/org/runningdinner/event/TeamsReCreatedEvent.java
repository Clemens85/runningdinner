package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Team;
import org.springframework.context.ApplicationEvent;

public class TeamsReCreatedEvent extends ApplicationEvent {

  private static final long serialVersionUID = 1L;

  private RunningDinner runningDinner;

  private List<Team> teams;

  public TeamsReCreatedEvent(Object source, List<Team> teams, RunningDinner runningDinner) {
    super(source);
    this.runningDinner = runningDinner;
    this.teams = teams;
  }

  public RunningDinner getRunningDinner() {
    return runningDinner;
  }

  public List<Team> getTeams() {
    return teams;
  }

  @Override
  public String toString() {
    return "runningDinner=" + runningDinner + ", teams=" + teams;
  }

}
