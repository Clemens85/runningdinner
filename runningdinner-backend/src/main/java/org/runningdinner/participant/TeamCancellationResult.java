
package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class TeamCancellationResult {

  private Team team;

  private List<Team> affectedGuestTeams = new ArrayList<>();

  private List<HostTeamInfo> affectedHostTeams = new ArrayList<>();

  private Set<Participant> removedParticipants;

  private boolean dinnerRouteMessagesSent;

  public Team getTeam() {

    return team;
  }

  public void setTeam(Team team) {

    this.team = team;
  }

  public List<Team> getAffectedGuestTeams() {

    return affectedGuestTeams;
  }

  public void setAffectedGuestTeams(List<Team> affectedGuestTeams) {

    this.affectedGuestTeams = affectedGuestTeams;
  }

  public List<HostTeamInfo> getAffectedHostTeams() {

    return affectedHostTeams;
  }

  public void setAffectedHostTeams(List<HostTeamInfo> affectedHostTeams) {

    this.affectedHostTeams = affectedHostTeams;
  }

  public Set<Participant> getRemovedParticipants() {

    return removedParticipants;
  }

  public void setRemovedParticipants(Set<Participant> removedParticipants) {

    this.removedParticipants = removedParticipants;
  }

  public boolean isDinnerRouteMessagesSent() {

    return dinnerRouteMessagesSent;
  }

  public void setDinnerRouteMessagesSent(boolean dinnerRouteMessagesSent) {

    this.dinnerRouteMessagesSent = dinnerRouteMessagesSent;
  }

}
