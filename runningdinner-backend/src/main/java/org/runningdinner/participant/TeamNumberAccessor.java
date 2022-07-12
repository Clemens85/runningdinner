package org.runningdinner.participant;

public final class TeamNumberAccessor {

  private final Team wrappedTeam;

  private TeamNumberAccessor(final Team wrappedTeam) {

    this.wrappedTeam = wrappedTeam;
  }

  public TeamNumberAccessor setTeamNumber(int teamNumber) {

    wrappedTeam.setTeamNumber(teamNumber);
    return this;
  }
  
  /**
   * Constructs a new accessor for the passed Team.
   *
   * @param team
   * @return
   */
  public static TeamNumberAccessor newAccessor(Team team) {

    return new TeamNumberAccessor(team);
  }

	
}
