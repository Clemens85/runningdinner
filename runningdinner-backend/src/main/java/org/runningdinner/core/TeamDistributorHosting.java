package org.runningdinner.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;
import com.google.common.collect.Sets.SetView;

public class TeamDistributorHosting {

  private List<Participant> participants;
  
  private RunningDinnerConfig configuration;

  private Multimap<FuzzyBoolean, Participant> hostingMap = ArrayListMultimap.create();
  
  private Set<Participant> alreadyDistributedParticipants = new HashSet<Participant>();
  
  public TeamDistributorHosting(List<Participant> participants, RunningDinnerConfig configuration) {

    super();
    this.participants = new ArrayList<>(participants);
    this.configuration = configuration;
    
    initalize();
  }

  private void initalize() {
    
    for (Participant p : participants) {
      hostingMap.put(configuration.canHost(p), p);
    }
  }

  public List<Team> calculateTeams() {

    final int numTeams = participants.size() / configuration.getTeamSize();

    List<Team> fixedTeamsForTeamPartnerWishes = generateFixedTeamsForTeamPartnerWishes();
    
    if (!configuration.isForceEqualDistributedCapacityTeams()) {
      return calculateRandomDistributedTeams(fixedTeamsForTeamPartnerWishes, numTeams);
    }

    int startIndex = fixedTeamsForTeamPartnerWishes.size();
    
    List<Team> result = new ArrayList<>(fixedTeamsForTeamPartnerWishes);
    for (int i = startIndex; i < numTeams; i++) {
      Team team = new Team(i + 1);
      
      Set<Participant> teamMembers = new HashSet<>();
      
      Participant participant1 = getBestMatchingParticipant(FuzzyBoolean.TRUE, null);
      FuzzyBoolean toggledHostingCapability = toggleHosting(configuration.canHost(participant1), true);
      Participant participant2 = getBestMatchingParticipant(toggledHostingCapability, participant1);

      teamMembers.add(participant1);
      teamMembers.add(participant2);
      team.setTeamMembers(teamMembers);

      alreadyDistributedParticipants.addAll(Arrays.asList(participant1, participant2));
      result.add(team);
    }
    return result;
  }

  private List<Team> calculateRandomDistributedTeams(List<Team> fixedTeamsForTeamPartnerWishes, int numTeams) {

    List<Team> result = new ArrayList<>(fixedTeamsForTeamPartnerWishes);
    for (int i = fixedTeamsForTeamPartnerWishes.size(); i < numTeams; i++) {
      List<Participant> randomTeamMembers = getNextRandomTeamMembers();
      Team team = new Team(i + 1);
      team.setTeamMembers(new HashSet<>(randomTeamMembers));
      result.add(team);
    }
    return result;
  }

  private Participant getBestMatchingParticipant(FuzzyBoolean requestedHostingCapability, Participant alreadySelectedParticipant) {
    
    Participant result = getAvailableParticipantForHostingCapability(requestedHostingCapability, alreadySelectedParticipant);
    if (result != null) {
      return result;
    }
    
    result = getAvailableParticipantForHostingCapability(FuzzyBoolean.UNKNOWN, alreadySelectedParticipant);
    if (result != null) {
      return result;
    }
    
    // Fallback
    Set<FuzzyBoolean> iteratedHostingCapabilities = new HashSet<>();
    iteratedHostingCapabilities.add(requestedHostingCapability);
    iteratedHostingCapabilities.add(FuzzyBoolean.UNKNOWN);
    
    SetView<FuzzyBoolean> remainingHostingCapabilities = Sets.difference(hostingMap.keySet(), iteratedHostingCapabilities);
    for (FuzzyBoolean reaminingHostingCapability : remainingHostingCapabilities) {
      result = getAvailableParticipantForHostingCapability(reaminingHostingCapability, alreadySelectedParticipant);
      if (result != null) {
        return result;
      }
    }
    
    throw new IllegalStateException("Could not determine matching participant for hosting-capability " + requestedHostingCapability + " and following state: " +
                                     hostingMap + ", " + alreadyDistributedParticipants);
  }
  
  private Participant getAvailableParticipantForHostingCapability(FuzzyBoolean requestedHostingCapability, Participant alreadySelectedParticipant) {

    Set<Participant> allMatchingParticipants = new HashSet<>(hostingMap.get(requestedHostingCapability));

    SetView<Participant> availableMatchingParticipants = Sets.difference(allMatchingParticipants, alreadyDistributedParticipants);
    
    for (Participant availableMatchingParticipant : availableMatchingParticipants) {
      if (alreadySelectedParticipant == null || !alreadySelectedParticipant.hasEqualNumber(availableMatchingParticipant)) {
        return availableMatchingParticipant;
      }
    }
    return null;
  }
  
  private static FuzzyBoolean toggleHosting(FuzzyBoolean canHost, boolean forceDistribution) {
    
    if (FuzzyBoolean.UNKNOWN == canHost || forceDistribution == false) {
      return FuzzyBoolean.UNKNOWN;
    }
    else if (FuzzyBoolean.TRUE == canHost) {
      return FuzzyBoolean.FALSE;
    }
    else { // False:
      return FuzzyBoolean.TRUE;
    }
  }

  private List<Participant> getNextRandomTeamMembers() {
    
    List<Participant> nextTeamMembers = new ArrayList<>(configuration.getTeamSize());
    
    for (Participant participant : participants) {
      if (alreadyDistributedParticipants.contains(participant)) {
        continue;
      }
      nextTeamMembers.add(participant);
      if (nextTeamMembers.size() == configuration.getTeamSize()) {
        break;
      }
    }
    alreadyDistributedParticipants.addAll(nextTeamMembers);
    return nextTeamMembers;
//    int currentIndex = alreadyDistributedParticipants.size();
//    for (int i = currentIndex; i < currentIndex + configuration.getTeamSize(); i++) {
//      Participant teamMember = participants.get(i);
//      nextTeamMembers.add(teamMember);
//    }
//    alreadyDistributedParticipants.addAll(nextTeamMembers);
//    return nextTeamMembers;
  }
  
  private List<Team> generateFixedTeamsForTeamPartnerWishes() {
    
    List<Team> result = new ArrayList<>();

    List<TeamPartnerWishTuple> teamPartnerWishTuples = TeamPartnerWishService.getTeamPartnerWishTuples(participants, configuration);
    int cnt = 0;
    for (TeamPartnerWishTuple teamPartnerWishTuple : teamPartnerWishTuples) {
      Team team = new Team(++cnt);
      Set<Participant> teamMembers = teamPartnerWishTuple.getParticipants();
      team.setTeamMembers(teamMembers);
      result.add(team);
      alreadyDistributedParticipants.addAll(teamMembers);
    }
    
    return result;
  }
  
}
