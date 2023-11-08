package org.runningdinner.participant;

public final class TeamAccessor {

  private final Team wrappedTeam;

  private TeamAccessor(final Team wrappedTeam) {
    this.wrappedTeam = wrappedTeam;
  }

  public TeamAccessor setTeamNumber(int teamNumber) {
    wrappedTeam.setTeamNumber(teamNumber);
    return this;
  }
  
  public TeamAccessor removeAllTeamMembers() {
    wrappedTeam.removeAllTeamMembers();
    return this;
  }
  
  /**
   * Constructs a new accessor for the passed Team.
   *
   * @param team
   * @return
   */
  public static TeamAccessor newAccessor(Team team) {

    return new TeamAccessor(team);
  }

	
}
