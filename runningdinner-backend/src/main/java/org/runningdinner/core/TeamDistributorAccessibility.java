package org.runningdinner.core;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Swaps team members so that each team containing a participant who requires an accessible home
 * gets a team member who can host at an accessible location.<br>
 * Team partner wishes are never touched and swaps never worsen the hosting capability of a team.
 */
public class TeamDistributorAccessibility {

  private static final Logger LOGGER = LoggerFactory.getLogger(TeamDistributorAccessibility.class);

  private final List<Team> teams;

  private final RunningDinnerConfig configuration;

  public TeamDistributorAccessibility(List<Team> teams, RunningDinnerConfig configuration) {

    this.teams = new ArrayList<>(teams);
    this.configuration = configuration;
  }

  public List<Team> calculateTeams() {

    List<Participant> participantsOfTeams = teams
                                              .stream()
                                              .map(Team::getTeamMembersOrdered)
                                              .flatMap(List::stream)
                                              .collect(Collectors.toList());

    if (participantsOfTeams.stream().noneMatch(Participant::isRequiresAccessibleHome)) {
      return teams;
    }

    List<TeamPartnerWishTuple> teamPartnerWishTuples = TeamPartnerWishService.getTeamPartnerWishTuples(participantsOfTeams, configuration);

    for (Team team : teams) {
      if (TeamPartnerWishTuple.isTeamReflectedByTeamPartnerWishTuples(team, teamPartnerWishTuples)) {
        continue;
      }

      // Each swap either satisfies the team or moves one requiring member out of it, hence this loop is bounded by the team size
      for (int i = 0; i < configuration.getTeamSize() && !isAccessibilitySatisfied(team.getTeamMembers(), configuration); i++) {
        SwapCandidate bestSwap = findBestSwap(team, teamPartnerWishTuples);
        if (bestSwap == null) {
          LOGGER.info("Could not find any swap for satisfying accessibility requirements of team {}", team.toStringDetailed());
          break;
        }

        LOGGER.info("Swapping {} of team {} with {} of team {} for satisfying accessibility requirements",
                    bestSwap.memberOfTeam(), team, bestSwap.memberOfOtherTeam(), bestSwap.otherTeam());
        team.removeTeamMember(bestSwap.memberOfTeam());
        bestSwap.otherTeam().removeTeamMember(bestSwap.memberOfOtherTeam());
        team.addTeamMember(bestSwap.memberOfOtherTeam());
        bestSwap.otherTeam().addTeamMember(bestSwap.memberOfTeam());
      }
    }

    return teams;
  }

  private SwapCandidate findBestSwap(Team team, List<TeamPartnerWishTuple> teamPartnerWishTuples) {

    SwapCandidate result = null;

    for (Team otherTeam : teams) {
      if (otherTeam.equals(team) || TeamPartnerWishTuple.isTeamReflectedByTeamPartnerWishTuples(otherTeam, teamPartnerWishTuples)) {
        continue;
      }

      for (Participant memberOfTeam : team.getTeamMembersOrdered()) {
        for (Participant memberOfOtherTeam : otherTeam.getTeamMembersOrdered()) {

          Set<Participant> teamMembersBefore = team.getTeamMembers();
          Set<Participant> otherTeamMembersBefore = otherTeam.getTeamMembers();
          Set<Participant> teamMembersAfter = swap(teamMembersBefore, memberOfTeam, memberOfOtherTeam);
          Set<Participant> otherTeamMembersAfter = swap(otherTeamMembersBefore, memberOfOtherTeam, memberOfTeam);

          boolean teamSatisfiedAfter = isAccessibilitySatisfied(teamMembersAfter, configuration);
          boolean otherTeamSatisfiedBefore = isAccessibilitySatisfied(otherTeamMembersBefore, configuration);
          boolean otherTeamSatisfiedAfter = isAccessibilitySatisfied(otherTeamMembersAfter, configuration);
          if (otherTeamSatisfiedBefore && !otherTeamSatisfiedAfter) {
            continue;
          }
          // It checks if the other team is satisfied after the swap and if the number of requiring members in the team after the swap is less than before. If not, it continues to the next iteration.
          boolean requiringMemberMovedToSatisfiedTeam = otherTeamSatisfiedAfter && countRequiringMembers(teamMembersAfter) < countRequiringMembers(teamMembersBefore);
          if (!teamSatisfiedAfter && !requiringMemberMovedToSatisfiedTeam) {
            continue;
          }
          if (getHostingLevel(teamMembersAfter) < getHostingLevel(teamMembersBefore) ||
              getHostingLevel(otherTeamMembersAfter) < getHostingLevel(otherTeamMembersBefore)) {
            continue;
          }

          int score = 0;
          if (teamSatisfiedAfter) {
            score += 8;
          }
          if (!isGenderWorsened(teamMembersBefore, teamMembersAfter) && !isGenderWorsened(otherTeamMembersBefore, otherTeamMembersAfter)) {
            score += 4;
          }
          // Keep accessible host locations spread over as many teams as possible (relevant for dinner routes):
          if (countAccessibleHostLocationTeams(teamMembersAfter, otherTeamMembersAfter) >= countAccessibleHostLocationTeams(teamMembersBefore, otherTeamMembersBefore)) {
            score += 2;
          }
          if (!otherTeamSatisfiedBefore && otherTeamSatisfiedAfter) {
            score += 1;
          }

          if (result == null || score > result.score()) {
            result = new SwapCandidate(otherTeam, memberOfTeam, memberOfOtherTeam, score);
          }
        }
      }
    }

    return result;
  }

  private static Set<Participant> swap(Set<Participant> teamMembers, Participant memberToRemove, Participant memberToAdd) {

    Set<Participant> result = new HashSet<>(teamMembers);
    result.remove(memberToRemove);
    result.add(memberToAdd);
    return result;
  }

  private static long countRequiringMembers(Collection<Participant> teamMembers) {

    return teamMembers.stream().filter(Participant::isRequiresAccessibleHome).count();
  }

  private int getHostingLevel(Collection<Participant> teamMembers) {

    if (teamMembers.stream().anyMatch(p -> configuration.canHost(p) == FuzzyBoolean.TRUE)) {
      return 2;
    }
    if (teamMembers.stream().anyMatch(p -> configuration.canHost(p) == FuzzyBoolean.UNKNOWN)) {
      return 1;
    }
    return 0;
  }

  private boolean isGenderWorsened(Collection<Participant> teamMembersBefore, Collection<Participant> teamMembersAfter) {

    if (configuration.getGenderAspects() == GenderAspect.IGNORE_GENDER) {
      return false;
    }
    return TeamDistributorGender.isGenderAspectSatisfied(new ArrayList<>(teamMembersBefore), configuration) &&
           !TeamDistributorGender.isGenderAspectSatisfied(new ArrayList<>(teamMembersAfter), configuration);
  }

  private int countAccessibleHostLocationTeams(Collection<Participant> teamMembers1, Collection<Participant> teamMembers2) {

    int result = 0;
    if (teamMembers1.stream().anyMatch(p -> canHostAtAccessibleLocation(p, configuration))) {
      result++;
    }
    if (teamMembers2.stream().anyMatch(p -> canHostAtAccessibleLocation(p, configuration))) {
      result++;
    }
    return result;
  }

  /**
   * A participant requiring accessibility is assumed to be able to access his own home, hence his home counts as accessible location.
   */
  public static boolean canHostAtAccessibleLocation(Participant participant, RunningDinnerConfig configuration) {

    return configuration.canHost(participant) == FuzzyBoolean.TRUE &&
           (participant.isHomeAccessible() || participant.isRequiresAccessibleHome());
  }

  public static boolean isAccessibilitySatisfied(Collection<Participant> teamMembers, RunningDinnerConfig configuration) {

    if (teamMembers.stream().noneMatch(Participant::isRequiresAccessibleHome)) {
      return true;
    }
    return teamMembers.stream().anyMatch(p -> canHostAtAccessibleLocation(p, configuration));
  }

  private record SwapCandidate(Team otherTeam, Participant memberOfTeam, Participant memberOfOtherTeam, int score) {
  }
}
