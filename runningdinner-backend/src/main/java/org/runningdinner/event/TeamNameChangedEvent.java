package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.context.ApplicationEvent;

public class TeamNameChangedEvent extends ApplicationEvent {

  private final RunningDinner runningDinner;

  private final Team team;

  /**
   * Null if the name was changed by an admin
   */
  private final Participant executingParticipant;

  public TeamNameChangedEvent(Object source, Team team, RunningDinner runningDinner, Participant executingParticipant) {
    super(source);
    this.team = team;
    this.runningDinner = runningDinner;
    this.executingParticipant = executingParticipant;
  }

  public RunningDinner getRunningDinner() {
    return runningDinner;
  }

  public Team getTeam() {
    return team;
  }

  public Participant getExecutingParticipant() {
    return executingParticipant;
  }

  public boolean isChangedByParticipant() {
    return executingParticipant != null;
  }

  @Override
  public String toString() {
    return "runningDinner=" + runningDinner + ", team=" + team + ", executingParticipant=" + executingParticipant;
  }
}
