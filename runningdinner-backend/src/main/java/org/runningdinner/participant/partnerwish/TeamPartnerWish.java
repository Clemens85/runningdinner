
package org.runningdinner.participant.partnerwish;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import org.runningdinner.participant.Participant;

import com.google.common.base.MoreObjects;

public class TeamPartnerWish {

  private TeamPartnerWishState state;

  private Participant subscribedParticipant;

  private Participant matchingParticipant;

  private Set<Participant> otherParticipantsWithThisTeamPartnerWish = Collections.emptySet();

  private TeamPartnerWish() {

  }

  public TeamPartnerWishState getState() {

    return state;
  }

  public Participant getSubscribedParticipant() {

    return subscribedParticipant;
  }

  public Participant getMatchingParticipant() {

    return matchingParticipant;
  }

  public Set<Participant> getOtherParticipantsWithThisTeamPartnerWish() {
  
    return otherParticipantsWithThisTeamPartnerWish;
  }

  public static TeamPartnerWish notExisting(Participant participant) {

    TeamPartnerWish result = new TeamPartnerWish();
    result.state = TeamPartnerWishState.NOT_EXISTING;
    result.subscribedParticipant = participant;
    return result;
  }

  public static TeamPartnerWish matchingButMatchHasNoPartnerWish(Participant participant, Participant matchingParticipant) {

    TeamPartnerWish result = new TeamPartnerWish();
    result.state = TeamPartnerWishState.EXISTS_EMPTY_TEAM_PARTNER_WISH;
    result.subscribedParticipant = participant;
    result.matchingParticipant = matchingParticipant;
    return result;
  }

  public static TeamPartnerWish matchingWithSamePartnerWish(Participant participant, Participant matchingParticipant) {

    TeamPartnerWish result = new TeamPartnerWish();
    result.state = TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH;
    result.subscribedParticipant = participant;
    result.matchingParticipant = matchingParticipant;
    return result;
  }

  public static TeamPartnerWish matchingButMatchHasOtherPartnerWish(Participant participant, Participant matchingParticipant) {

    TeamPartnerWish result = new TeamPartnerWish();
    result.state = TeamPartnerWishState.EXISTS_OTHER_TEAM_PARTNER_WISH;
    result.subscribedParticipant = participant;
    result.matchingParticipant = matchingParticipant;
    return result;
  }

  public static TeamPartnerWish noPartnerWishButOtherTeamPartnerWishes(Participant participant, Collection<Participant> foundParticipants) {

    TeamPartnerWish result = new TeamPartnerWish();
    result.state = TeamPartnerWishState.NO_PARTNER_WISH_BUT_OTHER_TEAM_PARTNER_WISHES;
    result.subscribedParticipant = participant;
    result.otherParticipantsWithThisTeamPartnerWish = new HashSet<>(foundParticipants);
    return result;
  }

  @Override 
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .add("state", state)
            .add("subscribedParticipant", subscribedParticipant)
            .add("matchingParticipant", matchingParticipant)
            .add("otherParticipantsWithThisTeamPartnerWish", otherParticipantsWithThisTeamPartnerWish)
            .toString();
  }
}
