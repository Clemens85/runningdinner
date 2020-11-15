
package org.runningdinner.participant.partnerwish;

import com.google.common.base.MoreObjects;
import com.google.common.collect.Sets;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

import java.util.List;
import java.util.Objects;
import java.util.Set;

public class TeamPartnerWishTuple {

  private Participant participant1;

  private Participant participant2;
  
  public TeamPartnerWishTuple(Participant participant1, Participant participant2) {

    super();
    this.participant1 = participant1;
    this.participant2 = participant2;
  }

  public Set<Participant> getParticipants() {
    
    return Sets.newHashSet(participant1, participant2);
  }
  
  public boolean isReflectedByTeam(Team team) {
    
    return team.getTeamMembers().equals(getParticipants());
  }
  
  public static boolean isTeamReflectedByTeamPartnerWishTuples(Team team, List<TeamPartnerWishTuple> teamPartnerWishTuples) {
    
    return teamPartnerWishTuples
            .stream()
            .anyMatch(teamPartnerWishTuple -> teamPartnerWishTuple.isReflectedByTeam(team));
  }

  @Override
  public boolean equals(Object o) {

    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    
    TeamPartnerWishTuple that = (TeamPartnerWishTuple) o;
    return Objects.equals(getParticipants(), that.getParticipants());
  }

  @Override
  public int hashCode() {

    return Objects.hash(getParticipants());
  }

  @Override 
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .addValue(participant1)
            .addValue(participant2)
            .toString();
  }
}
