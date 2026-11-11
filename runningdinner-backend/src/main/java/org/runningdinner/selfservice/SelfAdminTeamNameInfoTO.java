package org.runningdinner.selfservice;

public class SelfAdminTeamNameInfoTO {

  private String teamName;

  /**
   * False as soon as the dinner route mails were sent (the team name is then final)
   */
  private boolean teamNameChangeAllowed;

  public SelfAdminTeamNameInfoTO() {
    // JSON
  }

  public SelfAdminTeamNameInfoTO(String teamName, boolean teamNameChangeAllowed) {
    this.teamName = teamName;
    this.teamNameChangeAllowed = teamNameChangeAllowed;
  }

  public String getTeamName() {
    return teamName;
  }

  public void setTeamName(String teamName) {
    this.teamName = teamName;
  }

  public boolean isTeamNameChangeAllowed() {
    return teamNameChangeAllowed;
  }

  public void setTeamNameChangeAllowed(boolean teamNameChangeAllowed) {
    this.teamNameChangeAllowed = teamNameChangeAllowed;
  }
}
