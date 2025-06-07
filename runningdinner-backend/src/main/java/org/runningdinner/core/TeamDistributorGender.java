package org.runningdinner.core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.MoreObjects;

public class TeamDistributorGender {

  private static final Logger LOGGER = LoggerFactory.getLogger(TeamDistributorGender.class); 
  
  private final List<Team> teams;
  
  private final RunningDinnerConfig configuration;

  public TeamDistributorGender(List<Team> teams, RunningDinnerConfig configuration) {

    this.teams = new ArrayList<>(teams);
    this.configuration = configuration;
  }

  public List<Team> calculateTeams() {
    
    LOGGER.info("Running through calculateTeams in TeamDistributorGender for {} teams with {}", teams.size(), configuration.getGenderAspects());
    
    GenderAspect genderAspects = configuration.getGenderAspects();
    if (genderAspects == GenderAspect.IGNORE_GENDER) {
      return teams;
    }
    
    List<Participant> participantsOfTeams = teams
                                              .stream()
                                              .map(Team::getTeamMembersOrdered)
                                              .flatMap(List::stream)
                                              .collect(Collectors.toList());
    
    List<TeamPartnerWishTuple> teamPartnerWishTuples = TeamPartnerWishService.getTeamPartnerWishTuples(participantsOfTeams, configuration);
    
    for (int index = 0; index < teams.size(); index++) {
      
      Team team = teams.get(index);
      if (isGenderAspectSatisfied(team, configuration)) {
        continue;
      }

      List<Participant> teamMembers = team.getTeamMembersOrdered();

      LOGGER.info("Calculating swap action for {} in team {}", teamMembers.get(0), team);
      Set<TeamSwapAction> teamSwapActions = findAllTeamSwapActions(team, teamMembers.get(0), teamPartnerWishTuples);
      LOGGER.info("Calculating swap action for {} in team {}", teamMembers.get(1), team);
      teamSwapActions.addAll(findAllTeamSwapActions(team, teamMembers.get(1), teamPartnerWishTuples));

      TeamSwapAction bestTeamSwapAction = TeamSwapAction.findBestTeamSwapAction(teamSwapActions);
      if (bestTeamSwapAction != null) {
        swapTeamMember(bestTeamSwapAction.getSrcTeam().getTeam(), bestTeamSwapAction.getSrcTeam().getTeamMember(), 
                       bestTeamSwapAction.getDestTeam().getTeam(), bestTeamSwapAction.getDestTeam().getTeamMember());
      }
    }

    return teams;
  }

  private Set<TeamSwapAction> findAllTeamSwapActions(Team unbalancedTeam,
                                                     Participant teamMemberOfUnbalancedTeam,
                                                     List<TeamPartnerWishTuple> teamPartnerWishTuples) {

    final Set<TeamSwapAction> teamSwapActions = new HashSet<>();
    
    if (TeamPartnerWishTuple.isTeamReflectedByTeamPartnerWishTuples(unbalancedTeam, teamPartnerWishTuples)) {
      return teamSwapActions;
    }
    
    final Gender genderToSearchFor = toggleGender(unbalancedTeam, teamMemberOfUnbalancedTeam, configuration.getGenderAspects());

    for (Team teamCandidate : teams) {
      if (teamCandidate.getTeamNumber() == unbalancedTeam.getTeamNumber() || TeamPartnerWishTuple.isTeamReflectedByTeamPartnerWishTuples(teamCandidate, teamPartnerWishTuples)) {
        continue;
      }

      List<Participant> matchingTeamMembers = findTeamMembersWithGender(teamCandidate, genderToSearchFor);
      
      for (Participant matchingTeamMember : matchingTeamMembers) {
        
        Team teamCandidateClone = teamCandidate.createDetachedClone(true);
        Team unbalancedTeamClone = unbalancedTeam.createDetachedClone(true);

        LOGGER.info("Simulating swap of {} in team {} with {} in team {}", teamMemberOfUnbalancedTeam, unbalancedTeamClone, matchingTeamMember, teamCandidateClone);
        
        swapTeamMember(teamCandidateClone, matchingTeamMember, unbalancedTeamClone, teamMemberOfUnbalancedTeam);

        int comparisionStatusTeam = 0; // Assume same host capcity distribution if we don't need to consider it
        int comparisionStatusUnbalancedTeam = 0; // Assume same host capcity distribution if we don't need to consider it
        if (configuration.isForceEqualDistributedCapacityTeams()) {
          comparisionStatusTeam = compareHostingDistributionStatus(getHostingDistributionStatus(teamCandidate), getHostingDistributionStatus(teamCandidateClone));
          comparisionStatusUnbalancedTeam = compareHostingDistributionStatus(getHostingDistributionStatus(unbalancedTeam), getHostingDistributionStatus(unbalancedTeamClone));
        }

        if ((isGenderAspectSatisfied(teamCandidateClone, configuration) || isGenderAspectSatisfied(unbalancedTeamClone, configuration)) && 
            comparisionStatusTeam >= 0 && comparisionStatusUnbalancedTeam >= 0) {
          
          // The gender-aspect of the team-candidate must not be worsen than before swap:
          if (isGenderAspectSatisfied(teamCandidate, configuration) && !isGenderAspectSatisfied(teamCandidateClone, configuration)) {
            continue;
          }
          
          TeamSwapPreview teamSwapPreview1 = new TeamSwapPreview(unbalancedTeam, teamMemberOfUnbalancedTeam, comparisionStatusUnbalancedTeam, isGenderAspectSatisfied(unbalancedTeamClone, configuration));
          TeamSwapPreview teamSwapPreview2 = new TeamSwapPreview(teamCandidate, matchingTeamMember, comparisionStatusTeam, isGenderAspectSatisfied(teamCandidateClone, configuration));
          teamSwapActions.add(new TeamSwapAction(teamSwapPreview1, teamSwapPreview2));
        }
      }
    }

    return teamSwapActions;
  }

  private void swapTeamMember(Team team1, Participant teamMember1, Team team2, Participant teamMember2) {

    Participant otherTeamMemberInTeam2 = team2.getTeamMembers()
				.stream()
				.filter(p -> !Objects.equals(p, teamMember2))
				.findFirst()
				.orElse(null);
    if (otherTeamMemberInTeam2 == null) {
    	return;
    }
  	
    LOGGER.info("swapTeamMember: Team {} has {} members and Team {} has {} members", team1, team1.getTeamMembers().size(), team2, team2.getTeamMembers().size());
    team1.removeTeamMember(teamMember1);
    team2.removeTeamMember(otherTeamMemberInTeam2);
    team1.addTeamMember(otherTeamMemberInTeam2);
    team2.addTeamMember(teamMember1);
  }

  private HostingDistributionStatus getHostingDistributionStatus(Team team) {

    long numHosts = team.getTeamMembersOrdered().stream().filter(teamMember -> configuration.canHost(teamMember) == FuzzyBoolean.TRUE).count();
    long numNonHosts = team.getTeamMembersOrdered().stream().filter(teamMember -> configuration.canHost(teamMember) == FuzzyBoolean.FALSE).count();
    long numUnknownHosts = team.getTeamMembersOrdered().stream().filter(teamMember -> configuration.canHost(teamMember) == FuzzyBoolean.UNKNOWN).count();

    if (numHosts == 2) {
      return HostingDistributionStatus.ALL_HOST;
    }
    if (numNonHosts == 2) {
      return HostingDistributionStatus.NO_HOST;
    }
    if (numUnknownHosts == 2) {
      return HostingDistributionStatus.ALL_UNKNOWN;
    }
    if (numHosts == 1 && numNonHosts == 1) {
      return HostingDistributionStatus.ONE_HOST_ONE_NONHOST;
    }
    if (numHosts == 1 && numUnknownHosts == 1) {
      return HostingDistributionStatus.ONE_HOST_ONE_UNKNOWN;
    }
    if (numNonHosts == 1 && numUnknownHosts == 1) {
      return HostingDistributionStatus.ONE_NONHOST_ONE_UNKNOWN;
    }
    throw new IllegalStateException("Cannot determine HostingDistributionStatus for destTeam " + team);
  }

  private static int compareHostingDistributionStatus(HostingDistributionStatus a, HostingDistributionStatus b) {

    if (a == b) {
      return 0;
    }

    if ((a.canHost() && b.canHost()) || (a.canNotHost() && b.canNotHost())) {
      return 1;
    }

    if (a.canHost() && (b.canNotHost() || b == HostingDistributionStatus.ALL_UNKNOWN)) {
      return -1;
    }

    return 1;
  }

  private List<Participant> findTeamMembersWithGender(Team team, Gender gender) {

    return team.getTeamMembersOrdered()
            .stream()
            .filter(teamMember -> teamMember.getGender() == gender)
            .collect(Collectors.toList());
  }

  private static boolean isGenderAspectSatisfied(Team team, RunningDinnerConfig runningDinnerConfig) {
    
    List<Participant> teamMembers = team.getTeamMembersOrdered();
    if (runningDinnerConfig.getGenderAspects() == GenderAspect.FORCE_GENDER_MIX) {
      if (teamMembers.get(0).getGender() == Gender.UNDEFINED && teamMembers.get(1).getGender() == Gender.UNDEFINED) {
        return true;
      }
      if (teamMembers.get(0).getGender() == Gender.UNDEFINED || teamMembers.get(1).getGender() == Gender.UNDEFINED) {
        return false;
      }
      return teamMembers.get(0).getGender() != teamMembers.get(1).getGender();
    } else if (runningDinnerConfig.getGenderAspects() == GenderAspect.FORCE_SAME_GENDER) {
      return teamMembers.get(0).getGender() == teamMembers.get(1).getGender();
    }
    throw new IllegalStateException("Unsupported GenderApsect in here: " + runningDinnerConfig.getGenderAspects());
  }

  private static Gender toggleGender(Team team, Participant teamMemberWithGenderToToggle, GenderAspect genderAspect) {

    Participant otherTeamMember = team.getTeamMembers()
                                        .stream()
                                        .filter(teamMember -> !teamMember.equals(teamMemberWithGenderToToggle))
                                        .findAny()
                                        .get();
    
    if (genderAspect == GenderAspect.FORCE_GENDER_MIX) {
      if (Gender.MALE == teamMemberWithGenderToToggle.getGender()) {
        return Gender.FEMALE;
      } else if (Gender.FEMALE == teamMemberWithGenderToToggle.getGender()) {
        return Gender.MALE;
      } else {
        return otherTeamMember.getGender();
      }
    }
    // GenderAspect == GenderAspect.FORCE_SAME_GENDER:
    // For same gender:
    return teamMemberWithGenderToToggle.getGender();
  }

  public enum HostingDistributionStatus {

    ALL_HOST(4),

    ONE_HOST_ONE_NONHOST(1),

    ONE_HOST_ONE_UNKNOWN(2),

    ALL_UNKNOWN(0),

    ONE_NONHOST_ONE_UNKNOWN(-2),

    NO_HOST(-4);

    private final int value;

    HostingDistributionStatus(int value) {

      this.value = value;
    }

    public boolean isChangingToNonOrUnknownHosting(HostingDistributionStatus b) {

      return this.value + b.value <= this.value;
    }

    public boolean canHost() {
      return this.value > 0;
    }

    public boolean canNotHost() {
      return value < 0;
    }
  }

  static class TeamSwapPreview {

    private final Team team;

    private final Participant teamMember;

    private final int distributionComparisionStatus;
    
    private final boolean genderAspectSatisfied;

    public TeamSwapPreview(Team team, Participant teamMember, int distributionComparisionStatus, boolean genderAspectSatisfied) {

      super();
      this.team = team;
      this.teamMember = teamMember;
      this.distributionComparisionStatus = distributionComparisionStatus;
      this.genderAspectSatisfied = genderAspectSatisfied;
    }

    public Team getTeam() {

      return team;
    }

    public Participant getTeamMember() {

      return teamMember;
    }

    public int getDistributionComparisionStatus() {

      return distributionComparisionStatus;
    }

    public boolean isGenderAspectSatisfied() {

      return genderAspectSatisfied;
    }

    @Override
    public boolean equals(Object o) {

      if (this == o) {
        return true;
      }
      if (o == null || getClass() != o.getClass()) {
        return false;
      }
      TeamSwapPreview that = (TeamSwapPreview) o;
      return Objects.equals(team, that.team) && Objects.equals(teamMember, that.teamMember);
    }

    @Override
    public int hashCode() {

      return Objects.hash(team, teamMember);
    }

    @Override
    public String toString() {

      return MoreObjects.toStringHelper(this)
              .add("team", team)
              .add("teamMember", teamMember)
              .add("distributionComparisionStatus", distributionComparisionStatus)
              .add("genderAspectSatisfied", genderAspectSatisfied)
              .toString();
    }
  }

  static class TeamSwapAction {

    private final TeamSwapPreview srcTeam;

    private final TeamSwapPreview destTeam;

    public TeamSwapAction(TeamSwapPreview srcTeam, TeamSwapPreview destTeam) {

      this.srcTeam = srcTeam;
      this.destTeam = destTeam;
    }

    public TeamSwapPreview getDestTeam() {

      return destTeam;
    }

    public TeamSwapPreview getSrcTeam() {
    
      return srcTeam;
    }
    
    public boolean isGenderAspectSatisfiedForAllTeams() {
      
      return getSrcTeam().isGenderAspectSatisfied() && getDestTeam().isGenderAspectSatisfied();
    }

    public int getDistributionStatusSumForAllTeams() {
     
      return getSrcTeam().getDistributionComparisionStatus() + getDestTeam().getDistributionComparisionStatus();
    }
    
    public static TeamSwapAction findBestTeamSwapAction(Set<TeamSwapAction> teamSwapActions) {

      TeamSwapAction bestTeamSwapAction = null;

      for (TeamSwapAction currentTeamSwapAction : teamSwapActions) {
        
        if (currentTeamSwapAction.getSrcTeam().getDistributionComparisionStatus() < 0 || currentTeamSwapAction.getDestTeam().getDistributionComparisionStatus() < 0) {
          continue; // Should never happen
        }
        
        if (currentTeamSwapAction.getDistributionStatusSumForAllTeams() == 0 && 
            currentTeamSwapAction.getSrcTeam().isGenderAspectSatisfied() && currentTeamSwapAction.getDestTeam().isGenderAspectSatisfied()) {
          return currentTeamSwapAction;
        }
        
        if (bestTeamSwapAction == null && currentTeamSwapAction.getSrcTeam().isGenderAspectSatisfied()) {
          bestTeamSwapAction = currentTeamSwapAction;
        } else if (bestTeamSwapAction != null) {
          if (currentTeamSwapAction.isGenderAspectSatisfiedForAllTeams() && !bestTeamSwapAction.isGenderAspectSatisfiedForAllTeams()) {
            bestTeamSwapAction = currentTeamSwapAction;
          } else if (currentTeamSwapAction.getDistributionStatusSumForAllTeams() < bestTeamSwapAction.getDistributionStatusSumForAllTeams()) {
            bestTeamSwapAction = currentTeamSwapAction;
          }
        }
      }
      
      return bestTeamSwapAction;
    }

    @Override
    public boolean equals(Object o) {

      if (this == o) {
        return true;
      }
      if (o == null || getClass() != o.getClass()) {
        return false;
      }
      TeamSwapAction that = (TeamSwapAction) o;
      return Objects.equals(srcTeam, that.srcTeam) && Objects.equals(destTeam, that.destTeam);
    }

    @Override
    public int hashCode() {

      return Objects.hash(srcTeam, destTeam);
    }

    @Override
    public String toString() {

      return MoreObjects.toStringHelper(this)
              .add("srcTeam", srcTeam)
              .add("destTeam", destTeam)
              .toString();
    }
  }
}
