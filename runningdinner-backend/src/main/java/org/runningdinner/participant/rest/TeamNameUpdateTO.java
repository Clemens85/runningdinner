package org.runningdinner.participant.rest;

/**
 * Request for setting or clearing a custom team name. The name is normalized and validated by {@link org.runningdinner.participant.TeamNameUtil}
 * (the only place where validation happens, the client just displays the resulting validation issue at the field).
 */
public class TeamNameUpdateTO {

  private String teamName;

  public String getTeamName() {
    return teamName;
  }

  public void setTeamName(String teamName) {
    this.teamName = teamName;
  }
}
