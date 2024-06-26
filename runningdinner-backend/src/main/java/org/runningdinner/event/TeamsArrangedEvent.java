package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Team;

public class TeamsArrangedEvent extends AbstractAffectedTeamsEvent {

	private static final long serialVersionUID = 1L;

	public TeamsArrangedEvent(Object source, List<Team> teams, RunningDinner runningDinner) {
    super(source, teams, runningDinner);
  }

}