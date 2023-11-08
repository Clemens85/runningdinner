package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Team;

public class TeamArrangementsDroppedEvent extends AbstractAffectedTeamsEvent {
	
  private static final long serialVersionUID = 1L;
  
  private boolean teamsRecreated;

  public TeamArrangementsDroppedEvent(Object source, List<Team> teams, RunningDinner runningDinner, boolean teamsRecreated) {
    super(source, teams, runningDinner);
    this.teamsRecreated = teamsRecreated;
  }

  public boolean isTeamsRecreated() {
    return teamsRecreated;
  }

}
