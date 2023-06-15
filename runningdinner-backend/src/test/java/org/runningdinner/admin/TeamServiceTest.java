
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellation;
import org.runningdinner.participant.TeamCancellationResult;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.google.common.collect.ImmutableMap;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class TeamServiceTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7); 

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private TeamService teamService;

  @Autowired
  private ParticipantService participantService;

  @Autowired
  private ActivityService activityService;

  @Autowired
  private DataSource dataSource;
  
  private RunningDinner runningDinner;

  private JdbcTemplate jdbcTemplate;

  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    runningDinner = testHelperService.createClosedRunningDinner(DINNER_DATE, CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    jdbcTemplate = new JdbcTemplate(dataSource);
  }

  @Test
  public void testCancelTeamWithoutReplacement() {

    Team team = findFirstTeam();
    assertThat(team.getStatus()).isSameAs(TeamStatus.OK);
    Set<Participant> oldTeamMembers = team.getTeamMembers();

    TeamCancellation teamCancellation = newCancellationWithoutReplacement(team); 

    TeamCancellationResult result = teamService.cancelTeam(runningDinner.getAdminId(), teamCancellation);
    assertTeamCancellationResultWithoutNotification(result, oldTeamMembers);

    team = findFirstTeam();

    assertThat(team.getStatus()).isSameAs(TeamStatus.CANCELLED);
    assertThat(team.getTeamMembers()).isEmpty();

    assertParticipantsAreDeleted(oldTeamMembers);

    assertTeamCancelledActivityCreated();
  }

  @Test
  public void testCancelTeamWithReplacement() {

    List<Participant> twoAdditionalParticipants = ParticipantGenerator.generateParticipants(2, 18);
    Participant firstAddedParticipant = testHelperService.addParticipant(twoAdditionalParticipants.get(0), runningDinner); 
    twoAdditionalParticipants.get(1).setNumSeats(10); // Mark second participant as host
    Participant secondAddedParticipant = testHelperService.addParticipant(twoAdditionalParticipants.get(1), runningDinner); 

    Team team = findFirstTeam();
    assertThat(team.getStatus()).isSameAs(TeamStatus.OK);
    Set<Participant> oldTeamMembers = team.getTeamMembers();

    TeamCancellation teamCancellation = new TeamCancellation();
    teamCancellation.setReplaceTeam(true);
    teamCancellation.setTeamId(team.getId());
    teamCancellation.setReplacementParticipantIds(IdentifierUtil.getIds(Arrays.asList(firstAddedParticipant, secondAddedParticipant)));

    TeamCancellationResult result = teamService.cancelTeam(runningDinner.getAdminId(), teamCancellation);
    assertTeamCancellationResultWithoutNotification(result, oldTeamMembers);
    assertThat(result.getTeam().getTeamMembers()).containsExactlyInAnyOrder(firstAddedParticipant, secondAddedParticipant);

    team = findFirstTeam();

    assertThat(team.getStatus()).isSameAs(TeamStatus.REPLACED);
    assertThat(team.getTeamMembers()).hasSize(2);
    assertThat(team.getTeamMembers()).containsExactlyInAnyOrder(firstAddedParticipant, secondAddedParticipant);
    assertThat(team.getHostTeamMember()).isEqualTo(secondAddedParticipant);

    assertParticipantsAreDeleted(oldTeamMembers);

    assertTeamCancelledActivityCreated();
  }

  @Test(expected = ValidationException.class)
  public void testCancelTeamWithReplacementInvalid() {

    Team team = findFirstTeam();
    assertThat(team.getStatus()).isSameAs(TeamStatus.OK);
    Set<Participant> oldTeamMembers = team.getTeamMembers();

    TeamCancellation teamCancellation = new TeamCancellation();
    teamCancellation.setReplaceTeam(true);
    teamCancellation.setTeamId(team.getId());

    try {
      teamService.cancelTeam(runningDinner.getAdminId(), teamCancellation);
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues()).hasSize(1);
      team = findFirstTeam();
      assertThat(team.getStatus()).isEqualTo(TeamStatus.OK);
      assertThat(team.getTeamMembers()).containsExactlyInAnyOrder(oldTeamMembers.toArray(new Participant[] {}));
      throw e;
    }
  }

  @Test
  public void testUpdateTeamHost() {

    Team team = findFirstTeam();
    UUID hostingParticipantIdBeforeUpdate = team.getHostTeamMember().getId();
    Participant nonHostingParticipantBeforeUpdate = team.getTeamMembers().stream().filter(p -> !p.isHost()).findFirst().get();

    Map<UUID, UUID> teamHostMappings = ImmutableMap.of(team.getId(), nonHostingParticipantBeforeUpdate.getId());
    List<Team> updatedTeams = teamService.updateTeamHostersByAdmin(runningDinner.getAdminId(), teamHostMappings);
    assertThat(updatedTeams).hasSize(1);

    team = findFirstTeam();
    assertThat(team.getHostTeamMember()).isEqualTo(nonHostingParticipantBeforeUpdate);
    assertThat(team.getHostTeamMember().isHost()).isTrue();
    assertThat(team.getTeamMemberByParticipantId(hostingParticipantIdBeforeUpdate).isHost()).isFalse();
  }
  
  @Test
  public void testReGenerateTeamsAndVisitationPlans() throws NoPossibleRunningDinnerException {

    int numberOfTeams = teamService.getNumberOfTeams(runningDinner.getAdminId());
    assertThat(numberOfTeams).isEqualTo(9);
    Team firstTeam = findFirstTeam();
    assertHostTeamAndGuestTeamMappingSize(firstTeam, 2);
     
    teamService.dropAndReCreateTeamAndVisitationPlans(runningDinner.getAdminId(), Collections.emptyList());
    
    numberOfTeams = teamService.getNumberOfTeams(runningDinner.getAdminId());
    assertThat(numberOfTeams).isEqualTo(9);
    assertHostTeamAndGuestTeamMappingSize(firstTeam, 0);
    
    UUID idOfFirstTeamWhichIsNowDeleted = firstTeam.getId();
    Team newFirstTeam = findFirstTeam();
    assertThat(idOfFirstTeamWhichIsNowDeleted).isNotEqualTo(newFirstTeam.getId());
  }
  
  @Test
  public void testReGenerateTeamsAndVisitationPlansWithTooFewParticipants()  {

    Team firstTeam = findFirstTeam();
    teamService.cancelTeamMember(runningDinner.getAdminId(), firstTeam.getId(), firstTeam.getHostTeamMember().getId());
    
    try {
    	teamService.dropAndReCreateTeamAndVisitationPlans(runningDinner.getAdminId(), Collections.emptyList());
      Assert.fail("Expected ValidationException to be thrown!");
    } catch (ValidationException e) {
    	assertThat(e.getIssues().getIssues()).hasSize(1);
    	assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo("dinner_not_possible");
    }
    // Assert teams are not deleted!
    assertThat(teamService.getNumberOfTeams(runningDinner.getAdminId())).isEqualTo(9);
  }
  
  @Test
  public void testSwapTeamMembers() {

    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    
    Team firstTeam = allTeams.get(0);
    Team secondTeam = allTeams.get(1);
    Participant firstParticipant = firstTeam.getHostTeamMember();
    Participant secondParticipant = secondTeam.getHostTeamMember();
    
    List<Team> modifiedTeams = teamService.swapTeamMembers(runningDinner.getAdminId(), firstParticipant.getId(), secondParticipant.getId());
    assertThat(modifiedTeams).hasSize(2);
    assertThat(modifiedTeams).containsExactlyInAnyOrder(firstTeam, secondTeam);
    
    firstTeam = teamService.findTeamsWithMembersOrdered(runningDinner.getAdminId(), Collections.singleton(firstTeam.getId())).get(0);
    secondTeam = teamService.findTeamsWithMembersOrdered(runningDinner.getAdminId(), Collections.singleton(secondTeam.getId())).get(0);
    
    assertThat(firstTeam.getTeamMembers()).contains(secondParticipant);
    assertThat(firstTeam.getTeamMembers()).doesNotContain(firstParticipant);
    assertThat(secondTeam.getTeamMembers()).contains(firstParticipant);
    assertThat(secondTeam.getTeamMembers()).doesNotContain(secondParticipant);
    
    assertThat(firstTeam.getHostTeamMember()).isNotNull();
    assertThat(secondTeam.getHostTeamMember()).isNotNull();
    
    firstParticipant = participantService.findParticipantById(runningDinner.getAdminId(), firstParticipant.getId());
    secondParticipant = participantService.findParticipantById(runningDinner.getAdminId(), secondParticipant.getId());
    assertThat(firstParticipant.getTeamId()).isEqualTo(secondTeam.getId());
    assertThat(secondParticipant.getTeamId()).isEqualTo(firstTeam.getId());
  }
  
  @Test
  public void testSwapMembersWithOnlyOneHost() {
    
    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    Team firstTeam = allTeams.get(0);
    Team secondTeam = allTeams.get(1);
    
    updateNumSeats(firstTeam, true, false);
    updateNumSeats(secondTeam, false, false);
    
    Participant participantWhichIsAlreadyHost = firstTeam.getTeamMembersOrdered().get(0);
    Participant participantWhichIsNotHost = secondTeam.getTeamMembersOrdered().get(0);
    teamService.swapTeamMembers(runningDinner.getAdminId(), participantWhichIsAlreadyHost.getId(), participantWhichIsNotHost.getId());

    allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    firstTeam = allTeams.get(0);
    secondTeam = allTeams.get(1);
    
    assertThat(secondTeam.getHostTeamMember()).isEqualTo(participantWhichIsAlreadyHost);
    assertThat(firstTeam.getHostTeamMember()).isEqualTo(participantWhichIsNotHost);
    
    assertOnlyOneHost(firstTeam);
    assertOnlyOneHost(secondTeam);
  }
  
  @Test
  public void testSwapMembersWithOneHostInEachTeam() {
    
    // 1. test, swap exactly those participants which are host:
    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    Team firstTeam = allTeams.get(0);
    Team secondTeam = allTeams.get(1);
    
    updateNumSeats(firstTeam, true, false);
    updateNumSeats(secondTeam, false, true);
    
    Participant participant1WhichIsAlreadyHost = firstTeam.getTeamMembersOrdered().get(0);
    Participant participant2WhichIsAlreadyHost = secondTeam.getTeamMembersOrdered().get(1);
    teamService.swapTeamMembers(runningDinner.getAdminId(), participant1WhichIsAlreadyHost.getId(), participant2WhichIsAlreadyHost.getId());

    allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    firstTeam = allTeams.get(0);
    secondTeam = allTeams.get(1);
    
    assertThat(secondTeam.getHostTeamMember()).isEqualTo(participant1WhichIsAlreadyHost);
    assertThat(firstTeam.getHostTeamMember()).isEqualTo(participant2WhichIsAlreadyHost);
    
    assertOnlyOneHost(firstTeam);
    assertOnlyOneHost(secondTeam);
    
    // 2. test swap exactly those participants which are not host:
    Participant participant1WhichIsNotHost = getNonHostingTeamMember(firstTeam);
    Participant participant2WhichIsNotHost = getNonHostingTeamMember(secondTeam);
    teamService.swapTeamMembers(runningDinner.getAdminId(), participant1WhichIsNotHost.getId(), participant2WhichIsNotHost.getId());

    allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    firstTeam = allTeams.get(0);
    secondTeam = allTeams.get(1);
    
    assertThat(secondTeam.getHostTeamMember()).isEqualTo(participant1WhichIsAlreadyHost);
    assertThat(firstTeam.getHostTeamMember()).isEqualTo(participant2WhichIsAlreadyHost);
    
    assertOnlyOneHost(firstTeam);
    assertOnlyOneHost(secondTeam);
  }
  
  @Test
  public void testSwapTeamMembersFailsForTeamPartnerWishes() throws NoPossibleRunningDinnerException {

    // Setup some team-partner-wishes...
    List<Participant> participants = participantService.findActiveParticipantsAssignedToTeam(runningDinner.getAdminId());
    List<Participant> participantsWithChangedData = TestUtil.setMatchingTeamPartnerWish(participants, 3, 6, "max@mustermann.de", "maria@musterfrau.de", true);
    participantsWithChangedData
      .forEach(p -> testHelperService.updateParticipant(p));
    // ... Now re-generate teams so that team partner wishes will get applied:
    teamService.dropAndReCreateTeamAndVisitationPlans(runningDinner.getAdminId(), Collections.emptyList());
    
    // Setup another now known email-address for later test:
    participants.get(0).setEmail("ohne@freund.de");
    testHelperService.updateParticipant(participants.get(0));
    
    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    Team team = TestUtil.findTeamByTeamMemberEmail(allTeams, "max@mustermann.de");

    
    Team otherTeam = TestUtil.findTeamByTeamMemberEmail(allTeams, "ohne@freund.de");
    try {
      teamService.swapTeamMembers(runningDinner.getAdminId(), otherTeam.getHostTeamMember().getId(), team.getHostTeamMember().getId());
      Assert.fail("Expected swap between " + team + " and " + otherTeam + " to fail due to they are fixed due to team partner wishes");
    } catch (ValidationException e) {
      // NOP
    }
  }
  
  @Test
  public void testCancelOfTeamMemberRemovesTeamPartnerWish() throws NoPossibleRunningDinnerException {

    // Setup some team-partner-wishes...
    List<Participant> participants = participantService.findActiveParticipantsAssignedToTeam(runningDinner.getAdminId());
    List<Participant> participantsWithChangedData = TestUtil.setMatchingTeamPartnerWish(participants, 3, 6, "max@mustermann.de", "maria@musterfrau.de", true);
    participantsWithChangedData
      .forEach(p -> testHelperService.updateParticipant(p));
    // ... Now re-generate teams so that team partner wishes will get applied:
    teamService.dropAndReCreateTeamAndVisitationPlans(runningDinner.getAdminId(), Collections.emptyList());
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    List<TeamPartnerWishTuple> teamPartnerWishTuples = TeamPartnerWishService.getTeamPartnerWishTuples(participants, runningDinner.getConfiguration());
    assertThat(teamPartnerWishTuples).hasSize(1);
    
    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    Team team = TestUtil.findTeamByTeamMemberEmail(allTeams, "max@mustermann.de");

    teamService.cancelTeamMember(runningDinner.getAdminId(), team.getId(), team.getHostTeamMember().getId());
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    teamPartnerWishTuples = TeamPartnerWishService.getTeamPartnerWishTuples(participants, runningDinner.getConfiguration());
    assertThat(teamPartnerWishTuples).isEmpty();
  }
  
  @Test
  public void testChangeTeamHost() {

    List<Team> allTeams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    Team team = allTeams.get(0);
    
    Participant nonHostingTeamMemberBeforeUpdate = team.getTeamMembers().stream().filter(p -> !p.isHost()).findAny().get();

    assertThat(team.getHostTeamMember()).isNotEqualTo(nonHostingTeamMemberBeforeUpdate);

    teamService.updateTeamHostersByAdmin(runningDinner.getAdminId(), Collections.singletonMap(team.getId(), nonHostingTeamMemberBeforeUpdate.getId()));

    team = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), team.getId());
    assertThat(team.getHostTeamMember()).isEqualTo(nonHostingTeamMemberBeforeUpdate);

    List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
    List<Activity> customAdminChangesActivities = activities
                                                    .stream()
                                                    .filter(a -> a.getActivityType() == ActivityType.CUSTOM_ADMIN_CHANGE)
                                                    .collect(Collectors.toList());
    assertThat(customAdminChangesActivities).hasSize(1);
    Activity customAdminChangeActivity = customAdminChangesActivities.get(0);
    assertThat(customAdminChangeActivity.getActivityHeadline()).contains("Gastgeber");
  }
  
  @Test
  public void testFilterCancelledTeams() {

    assertThat(teamService.findTeamArrangements(runningDinner.getAdminId(), true)).hasSize(9);
    
    Team team = findFirstTeam();

    TeamCancellation teamCancellation = new TeamCancellation();
    teamCancellation.setReplaceTeam(false);
    teamCancellation.setTeamId(team.getId());

    teamService.cancelTeam(runningDinner.getAdminId(), teamCancellation);
    
    assertThat(teamService.findTeamArrangements(runningDinner.getAdminId(), true)).hasSize(8);
  }
  
  @Test
  public void teamsToBeUsedForWaitingList() {
  	
    String adminId = runningDinner.getAdminId();
		assertThat(teamService.findTeamArrangementsWaitingListFillable(adminId))
    	.isEmpty();
    
    List<Team> allTeams = teamService.findTeamArrangements(adminId, false);
    Team firstTeam = allTeams.get(0);
    Team lastTeam = allTeams.get(8);
    
    teamService.cancelTeamMember(adminId, firstTeam.getId(), firstTeam.getHostTeamMember().getId());
    
		assertThat(teamService.findTeamArrangementsWaitingListFillable(adminId))
			.containsExactly(firstTeam);
		
		teamService.cancelTeam(adminId, newCancellationWithoutReplacement(lastTeam));
		
		assertThat(teamService.findTeamArrangementsWaitingListFillable(adminId))
			.containsExactly(firstTeam, lastTeam);
  }
  
  private TeamCancellation newCancellationWithoutReplacement(Team team) {
  	
  	TeamCancellation result = new TeamCancellation();
  	result.setTeamId(team.getId());
  	result.setDryRun(false);
  	result.setReplaceTeam(false);
  	return result;
  }
  
  private Team findFirstTeam() {

    List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false);
    return teams.get(0);
  }

  private void assertTeamCancellationResultWithoutNotification(TeamCancellationResult teamCancellationResult,
    Set<Participant> oldTeamMembers) {

    assertThat(teamCancellationResult).isNotNull();
    assertThat(teamCancellationResult.getRemovedParticipants()).containsExactlyInAnyOrder(oldTeamMembers.toArray(new Participant[] {}));
    assertThat(teamCancellationResult.isDinnerRouteMessagesSent()).isFalse();
  }

  private void assertTeamCancelledActivityCreated() {

    List<Activity> customAdminChangeActivities = activityService.findActivitiesByTypes(runningDinner.getAdminId(), ActivityType.CUSTOM_ADMIN_CHANGE);
    assertThat(customAdminChangeActivities).isNotEmpty();
    for (Activity customAdminChangeActivity : customAdminChangeActivities) {
      if (customAdminChangeActivity.getActivityMessage().contains("Folgende Teilnehmer")) {
        return;
      }
    }
    Assert.fail("Could not find activity for team cancellati0on in " + customAdminChangeActivities);
  }

  private void assertParticipantsAreDeleted(Set<Participant> participants) {

    List<Participant> result = participantService.findParticipantsByIds(runningDinner.getAdminId(), IdentifierUtil.getIds(participants));
    assertThat(result).isEmpty();
  }
  
  private void assertHostTeamAndGuestTeamMappingSize(Team team, int numExpectedMappings) {

    Integer numHosts = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM runningdinner.HostTeamMapping WHERE hostteamid = '" + team.getId().toString() + "'", Integer.class);
    Integer numHostsParent = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM runningdinner.HostTeamMapping WHERE parentteamid = '" + team.getId().toString() + "'", Integer.class);
    assertThat(numHosts).isEqualTo(numExpectedMappings);
    assertThat(numHostsParent).isEqualTo(numExpectedMappings);
    
    Integer numGuests = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM runningdinner.GuestTeamMapping WHERE guestteamid = '" + team.getId().toString() + "'", Integer.class);
    Integer numGuestsParent = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM runningdinner.GuestTeamMapping WHERE parentteamid = '" + team.getId().toString() + "'", Integer.class);
    assertThat(numGuests).isEqualTo(numExpectedMappings);
    assertThat(numGuestsParent).isEqualTo(numExpectedMappings);
  }
  
  private void assertOnlyOneHost(Team team) {

    int numHosts = 0;
    
    Set<Participant> teamMembers = team.getTeamMembers();
    for (Participant teamMember : teamMembers) {
      if (teamMember.isHost()) {
        numHosts++;
      }
    }
    assertThat(numHosts).as("Expected only one host for " + team + " but found " + numHosts).isEqualTo(1);
  }

  private List<Participant> updateNumSeats(Team team, boolean firstIsHost, boolean secondIsHost) {
    
    List<Participant> teamMembers = team.getTeamMembersOrdered();
    teamMembers.get(0).setNumSeats(firstIsHost ? 8 : 2);
    teamMembers.get(1).setNumSeats(secondIsHost ? 8 : 2);
    teamMembers.get(0).setHost(firstIsHost);
    teamMembers.get(1).setHost(secondIsHost);
    
    return testHelperService.saveParticipants(teamMembers);
  }
  
  private static Participant getNonHostingTeamMember(Team team) {
    
    return team.getTeamMembers()
            .stream()
            .filter(tm -> !tm.isHost())
            .findAny()
            .orElseThrow(IllegalStateException::new);
  }

}
