
package org.runningdinner.core;

import java.util.Collections;
import java.util.List;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

/**
 * This class is used during generation of a running dinner and is enriched by each call to methods of {@link RunningDinnerCalculator}
 * 
 * @author Clemens Stich
 * 
 */
public class GeneratedTeamsResult {

  private List<Team> regularTeams;

  private List<Participant> notAssignedParticipants;

  /**
   * Returns the teams that could be generated during the calculation of a running dinner.
   * 
   * @return
   */
  public List<Team> getRegularTeams() {

    if (regularTeams == null) {
      return Collections.emptyList();
    }
    return regularTeams;
  }

  /**
   * Returns all participants that could not be assigned to teams during the calculation of a running dinner.<br>
   * In an ideal case this list is empty which means that all participants could successfully be assigned into teams.
   * 
   * @return
   */
  public List<Participant> getNotAssignedParticipants() {

    if (notAssignedParticipants == null) {
      return Collections.emptyList();
    }
    return notAssignedParticipants;
  }


  /**
   * True if not all participants could be assigend into teams
   * 
   * @return
   */
  public boolean hasNotAssignedParticipants() {

    return notAssignedParticipants != null && notAssignedParticipants.size() > 0;
  }

  void setRegularTeams(List<Team> regularTeams) {

    this.regularTeams = regularTeams;
  }

  void setNotAssignedParticipants(List<Participant> notAssignedMembers) {

    this.notAssignedParticipants = notAssignedMembers;
  }

}
