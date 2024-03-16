package org.runningdinner.core;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

public class TeamDistributorGenderHostingTest {
  
  @Test
  public void testMixGenderWithAllSameGender() {

    List<Team> teams = buildTeams(
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfigWithMixedGender).calculateTeams();
    
    for (Team team : teams) {
      TeamDistributorHostingTest.assertOneHostOneNoHost(team, Configurations.standardConfigWithMixedGender);
    }
  }
  
  @Test
  public void testMixGenderWithDifferentGenders() {

    List<Team> teams = buildTeams(
      newTeam(6, Gender.MALE, 4, Gender.MALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.MALE, 4, Gender.FEMALE)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfigWithMixedGender)
                  .calculateTeams();
    
    // Ensure hosting distribution is still optimal:
    List<Team> teamsWithGoodHostingCapability = TeamDistributorHostingTest.findTeamsWithGoodHostingCapability(teams, Configurations.standardConfigWithMixedGender);
    assertThat(teamsWithGoodHostingCapability).hasSize(2);
    
    List<Team> teamsWithGenderAspectsSatisfied = findTeamsWithGenderAspectsSatisfied(teams, Configurations.standardConfigWithMixedGender);
    assertThat(teamsWithGenderAspectsSatisfied).hasSize(3);
  }
  
  @Test
  public void testMixGenderWithDifferentGendersAndUnknownGender() {
  
    List<Team> teams = buildTeams(
      newTeam(6, Gender.MALE, 4, Gender.MALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.UNDEFINED, 4, Gender.FEMALE),
      newTeam(4, Gender.MALE, 4, Gender.UNDEFINED)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfigWithMixedGender)
                  .calculateTeams();
    
    // Ensure hosting distribution is still optimal:
    List<Team> teamsWithGoodHostingCapability = TeamDistributorHostingTest.findTeamsWithGoodHostingCapability(teams, Configurations.standardConfigWithMixedGender);
    assertThat(teamsWithGoodHostingCapability).hasSize(2);
    
    List<Team> teamsWithGenderAspectsSatisfied = findTeamsWithGenderAspectsSatisfied(teams, Configurations.standardConfigWithMixedGender);
    assertThat(teamsWithGenderAspectsSatisfied).hasSize(3);
  }
  
  @Test
  public void testIgnoreGender() {

    List<Team> teams = buildTeams(
      newTeam(6, Gender.MALE, 4, Gender.MALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.MALE, 4, Gender.FEMALE)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfig)
                  .calculateTeams();
    
    // Ensure hosting distribution is still optimal:
    List<Team> teamsWithGoodHostingCapability = TeamDistributorHostingTest.findTeamsWithGoodHostingCapability(teams, Configurations.standardConfigWithMixedGender);
    assertThat(teamsWithGoodHostingCapability).hasSize(2);
    // Nothing more to test
  }
  
  @Test
  public void testSameGender() {
    
    List<Team> teams = buildTeams(
      newTeam(6, Gender.MALE, 4, Gender.MALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.MALE, 4, Gender.MALE)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfigWithSameGender)
                  .calculateTeams();
    
    // Ensure hosting distribution is still optimal:
    List<Team> teamsWithGoodHostingCapability = TeamDistributorHostingTest.findTeamsWithGoodHostingCapability(teams, Configurations.standardConfigWithSameGender);
    assertThat(teamsWithGoodHostingCapability).hasSize(2);
    
    List<Team> teamsWithGenderAspectsSatisfied = findTeamsWithGenderAspectsSatisfied(teams, Configurations.standardConfigWithSameGender);
    assertThat(teamsWithGenderAspectsSatisfied).hasSize(4);
  }
  
  @Test
  public void testMixGenderWithoutConsideringHostingCapability() {
    
    List<Team> teams = buildTeams(
      newTeam(6, Gender.MALE, 4, Gender.MALE), 
      newTeam(6, Gender.FEMALE, 4, Gender.FEMALE),
      newTeam(4, Gender.UNDEFINED, 4, Gender.FEMALE),
      newTeam(4, Gender.MALE, 4, Gender.UNDEFINED)
    );
    teams = new TeamDistributorGender(teams, Configurations.standardConfigWithoutDistributingButMixedGender)
                  .calculateTeams();
    
    List<Team> teamsWithGenderAspectsSatisfied = findTeamsWithGenderAspectsSatisfied(teams, Configurations.standardConfigWithoutDistributingButMixedGender);
    assertThat(teamsWithGenderAspectsSatisfied).hasSize(3);

    Optional<Team> teamWithAllUndefinedGender = teams
                                                  .stream()
                                                  .filter(t -> t.getTeamMembersOrdered().get(0).getGender() == Gender.UNDEFINED && 
                                                               t.getTeamMembersOrdered().get(1).getGender() == Gender.UNDEFINED)
                                                  .findAny();
    assertThat(teamWithAllUndefinedGender).isPresent();
  }
  
  private List<Team> findTeamsWithGenderAspectsSatisfied(List<Team> teams, RunningDinnerConfig configuration) {

    List<Team> result = new ArrayList<>();
    
    for (Team team : teams) {
      List<Participant> teamMembers = team.getTeamMembersOrdered();
      Participant teamMember1 = teamMembers.get(0);
      Participant teamMember2 = teamMembers.get(1);
      if (configuration.getGenderAspects() == GenderAspect.FORCE_GENDER_MIX && teamMember1.getGender() != teamMember2.getGender() &&
          teamMember1.getGender() != Gender.UNDEFINED && teamMember2.getGender() != Gender.UNDEFINED) {
        result.add(team);
      } else if (configuration.getGenderAspects() == GenderAspect.FORCE_SAME_GENDER && teamMember1.getGender() == teamMember2.getGender() &&
                 teamMember1.getGender() != Gender.UNDEFINED && teamMember2.getGender() != Gender.UNDEFINED) {
        result.add(team);
      } else if (configuration.getGenderAspects() == GenderAspect.IGNORE_GENDER) {
        result.add(team);
      }
    }
    
    return result;
  }

  @SafeVarargs
  private final List<Team> buildTeams(List<Participant> ... teamMembers) {

    List<Team> result = new ArrayList<>();
    
    int participantNr = 0;
    for (List<Participant> teamMembersOfTeam :teamMembers) {
      teamMembersOfTeam.get(0).setParticipantNumber(++participantNr);
      teamMembersOfTeam.get(1).setParticipantNumber(++participantNr);
      Team team = new Team(participantNr / 2);
      team.setTeamMembers(new HashSet<>(teamMembersOfTeam));
      result.add(team);
    }
    
    return result;
  }

  private List<Participant> newTeam(int numSeatsMember1, Gender genderMember1, int numSeatsMember2, Gender genderMember2) {

    Participant teamMember1 = ParticipantGenerator.generateParticipant(1);
    teamMember1.setGender(genderMember1);
    teamMember1.setNumSeats(numSeatsMember1);
    
    Participant teamMember2 = ParticipantGenerator.generateParticipant(2);
    teamMember2.setGender(genderMember2);
    teamMember2.setNumSeats(numSeatsMember2);

    return Arrays.asList(teamMember1, teamMember2);
  }
  

}
