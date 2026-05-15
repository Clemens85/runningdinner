package org.runningdinner.admin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.runningdinner.test.util.PrivateFieldAccessor;
import org.runningdinner.test.util.TestUtil;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

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

  @Test
  public void fixedTeamPartnerWishTupleOverridesEmailBasedTupleWhenParticipantOccursInBoth() {

    // B (idx 0) and A (idx 1) have a mutual email-based partner wish -> creates email-based tuple (B | A)
    List<Participant> emailBasedPair = TestUtil.setMatchingTeamPartnerWish(teamMembers, 0, 1, "b@test.de", "a@test.de", true);
    Participant b = emailBasedPair.getFirst(); // index 0 = B

    // B also invited A' via fixed (parent-child) team-partner-wish registration; B is the registration root
    UUID bId = UUID.randomUUID();
    PrivateFieldAccessor.setField(b, "id", bId);
    b.setTeamPartnerWishOriginatorId(bId);

    // A' is the child participant registered by B
    Participant aPrime = teamMembers.get(2);
    PrivateFieldAccessor.setField(aPrime, "id", UUID.randomUUID());
    aPrime.setTeamPartnerWishOriginatorId(bId);

    // Only the fixed tuple (B | A') should be kept; the email-based tuple (B | A) must be removed
    List<TeamPartnerWishTuple> result = TeamPartnerWishService.getTeamPartnerWishTuples(teamMembers, configuration);
    assertThat(result).hasSize(1);
    assertThat(result.getFirst().getParticipants()).extracting("email").containsExactlyInAnyOrder("b@test.de", aPrime.getEmail());
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
