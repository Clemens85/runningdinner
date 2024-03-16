package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.runningdinner.test.util.TestUtil;

public class TeamPartnerWishServiceGenerateTuplesTest {

  private List<Participant> teamMembers;
  private RunningDinnerConfig configuration;
  
  @BeforeEach
  public void setUp() {
    
    teamMembers = ParticipantGenerator.generateParticipants(18);
    configuration = RunningDinnerConfig.newConfigurer().withTeamPartnerWishDisabled(false).build();
  }
  
  @Test
  public void noSinglePartnerWish() {
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).isEmpty();
  }
  
  @Test
  public void singleMatchingTeamPartnerWish() {
    
    setMatchingTeamPartnerWish(0, 6, "max@mustermann.de", "maria@musterfrau.de");
    
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).hasSize(1);
    assertThat(result.get(0).getParticipants()).extracting("email").containsExactlyInAnyOrder("max@mustermann.de", "maria@musterfrau.de");
  }
  
  @Test
  public void multipleMatchingTeamPartnerWishes() {
    
    setMatchingTeamPartnerWish(0, 10, "max@mustermann.de", "maria@musterfrau.de");
    setMatchingTeamPartnerWish(16, 17, "foo@bar.de", "bar@foo.de");
    
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).hasSize(2);
    TeamPartnerWishTuple teamPartnerWish = getWithTeamPartnerWish(result, "max@mustermann.de");
    assertThat(teamPartnerWish.getParticipants()).extracting("email").containsExactlyInAnyOrder("max@mustermann.de", "maria@musterfrau.de");
    teamPartnerWish = getWithTeamPartnerWish(result, "foo@bar.de");
    assertThat(teamPartnerWish.getParticipants()).extracting("email").containsExactlyInAnyOrder("foo@bar.de", "bar@foo.de");
  }
  
  @Test
  public void singleTeamPartnerWishWithoutMatch() {
   
    teamMembers.get(0).setTeamPartnerWishEmail("foo@bar.de");
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).isEmpty();
  }
  
  @Test
  public void teamPartnerWishWithOneMatchAndOneAdditionalWishNotMatching() {
    
    setMatchingTeamPartnerWish(0, 10, "max@mustermann.de", "maria@musterfrau.de");
    teamMembers.get(5).setTeamPartnerWishEmail("max@mustermann.de");
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).hasSize(1);
    assertThat(result.get(0).getParticipants()).extracting("participantNumber").containsExactlyInAnyOrder(1, 11); // idx + 1
  }
  
  @Test
  public void noMatchingPartnerWishWhenDisabledInConfig() {
    
    setMatchingTeamPartnerWish(0, 6, "max@mustermann.de", "maria@musterfrau.de");
    
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).hasSize(1);
    
    configuration.setTeamPartnerWishDisabled(true);
    result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).isEmpty();
  }
  
  private TeamPartnerWishTuple getWithTeamPartnerWish(List<TeamPartnerWishTuple> teamPartnerWishTuples, String teamPartnerWishEmail) {

    for (TeamPartnerWishTuple teamPartnerWishTuple : teamPartnerWishTuples) {
      boolean found = teamPartnerWishTuple.getParticipants()
                        .stream()
                        .map(Participant::getTeamPartnerWishEmail)
                        .anyMatch(teamPartnerWishEmail::equalsIgnoreCase);
      if (found) {
        return teamPartnerWishTuple;
      }
    }
    throw new IllegalStateException("Expected to find teamPartnerWishTuple in " + teamPartnerWishTuples + " for teamPartnerWish " + teamPartnerWishEmail);
  }

  private void setMatchingTeamPartnerWish(int idx1, int idx2, String email1, String email2) {
    
    TestUtil.setMatchingTeamPartnerWish(teamMembers, idx1, idx2, email1, email2, true);
  }
  
}
