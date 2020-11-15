package org.runningdinner.participant.rest;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.participant.partnerwish.TeamPartnerWish;
import org.runningdinner.participant.partnerwish.TeamPartnerWishState;

public class TeamPartnerWishTO {

  private boolean relevant = false;
  
  private TeamPartnerWishState state;

  private ParticipantTO subscribedParticipant;

  private ParticipantTO matchingParticipant;

  protected TeamPartnerWishTO() {

  }

  public TeamPartnerWishState getState() {

    return state;
  }

  public ParticipantTO getSubscribedParticipant() {

    return subscribedParticipant;
  }

  public ParticipantTO getMatchingParticipant() {

    return matchingParticipant;
  }
  public boolean isRelevant() {
  
    return relevant;
  }

  public static TeamPartnerWishTO newFromTeamPartnerWish(TeamPartnerWish teamPartnerWish, List<TeamPartnerWishState> relevantStatesList) {

    TeamPartnerWishTO result = new TeamPartnerWishTO();
    if (teamPartnerWish.getMatchingParticipant() != null) {
      result.matchingParticipant = new ParticipantTO(teamPartnerWish.getMatchingParticipant());
    }
    if (teamPartnerWish.getSubscribedParticipant() != null) {
      result.subscribedParticipant = new ParticipantTO(teamPartnerWish.getSubscribedParticipant());
    }
    result.state = teamPartnerWish.getState();

    Set<TeamPartnerWishState> relevantStates = Collections.emptySet();
    if (CollectionUtils.isNotEmpty(relevantStatesList)) {
      relevantStates = new HashSet<>(relevantStatesList);
    }
    result.relevant = CollectionUtils.isEmpty(relevantStates) || relevantStates.contains(result.state);
    
    return result;
  }

  public static TeamPartnerWishTO newEmptyObject() {
    
    return new TeamPartnerWishTO();
  }
}
