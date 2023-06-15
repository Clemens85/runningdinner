package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.WaitingListAction;
import org.runningdinner.participant.WaitingListActionResult;
import org.runningdinner.participant.WaitingListData;
import org.runningdinner.participant.WaitingListService;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamParticipantsAssignmentTO;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class WaitingListServiceTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7); 

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private TeamService teamService;

  @Autowired
  private ParticipantService participantService;

  @Autowired
  private WaitingListService waitingListService;

	@Autowired
	private MessageService messageService;

	@Autowired
	private ActivityService activityService;
	
  private RunningDinner runningDinner;

	private String adminId;

  @Test
  public void assignParticipantToTeamWithCancelledMember() {
  	
  	setupRunningDinnerWithParticipants(26);
  	
  	List<Team> teams = teamService.findTeamArrangements(adminId, true);
  	Team firstTeam = teams.get(0);
  	
  	Participant remainingParticipant = firstTeam.getTeamMembersOrdered().get(1);
  	firstTeam = teamService.cancelTeamMember(adminId, firstTeam.getId(), firstTeam.getTeamMembersOrdered().get(0).getId());
  	
  	assertThat(firstTeam.getTeamMembersOrdered()).hasSize(1);

		List<Participant> participantsOnWaitingList = participantService.findActiveParticipantsNotAssignedToTeam(adminId);
  	Participant firstParticipantOnWaitingList = participantsOnWaitingList.get(0);
    List<TeamParticipantsAssignmentTO> assignments = Arrays
        .asList(newTeamParticipantsAssignment(firstTeam, firstParticipantOnWaitingList));

		WaitingListActionResult result = waitingListService.assignParticipantsToExistingTeams(adminId, assignments);
		
		firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeam.getId());
		assertThat(firstTeam.getTeamMembersOrdered()).hasSize(2);
		assertThat(firstTeam.getTeamMembersOrdered()).containsExactly(remainingParticipant, firstParticipantOnWaitingList);
		assertThat(firstTeam.getHostTeamMember()).isNotNull();
		assertThat(firstTeam.getStatus()).isEqualTo(TeamStatus.OK);
		
		firstParticipantOnWaitingList = participantService.findParticipantById(adminId, firstParticipantOnWaitingList.getId());
		assertThat(firstParticipantOnWaitingList.getTeamId()).isEqualTo(firstTeam.getId());
		
		assertThat(result.getAffectedTeams())
			.extracting("teamNumber", Integer.class)
			.containsExactly(firstTeam.getTeamNumber());
		
		assertThat(result.isTeamMessagesAlreadySent()).isFalse();
		assertThat(result.isDinnerRouteMessagesAlreadySent()).isFalse();
		
		assertActivityTypeContained(ActivityType.WAITINGLIST_PARTICIPANTS_ASSIGNED);
  }

	@Test
  public void generateNewTeams() {
  	
  	setupRunningDinnerWithParticipants(18);
  	
  	addParticipants(6, 18);
  	
  	WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
  	List<ParticipantTO> participantsForNewTeams = waitingListData.getParticiptantsForTeamArrangement();
  	Set<UUID> participantIdsForNewTeams = IdentifierUtil.getIds(participantsForNewTeams);
  	
    sendTeamMessages();
    
  	List<Team> teamsBeforeGeneration = teamService.findTeamArrangements(adminId, true);
  	
  	WaitingListActionResult result = waitingListService.generateNewTeams(adminId, participantsForNewTeams);
  	
  	List<Team> allTeams = teamService.findTeamArrangements(adminId, true);
  	for (int i = 0; i < allTeams.size(); i++) {
  		
			Team team = allTeams.get(i);
			Set<Participant> teamMembers = team.getTeamMembers();
			Set<UUID> teamMemberIds = IdentifierUtil.getIds(teamMembers);
  		
  		if (i < 9) { // The first 9 teams were already existing and should NOT be changed:
  			assertThat(teamMemberIds)
					.as("Team " + team + " should not be changed and thus not contain any of the participants from waitinglist")
  				.doesNotContainAnyElementsOf(participantIdsForNewTeams);
  		} else {
  			assertThat(teamMemberIds)
					.as("Team " + team + " is a new team and should hence contain only the participants from waitinglist")
  				.isSubsetOf(participantIdsForNewTeams); 			
  		}
  		
  		assertThat(teamMemberIds).hasSize(2);
  	}
  	
  	List<TeamTO> newGeneratedTeams = result.getAffectedTeams();
  	assertThat(newGeneratedTeams).hasSize(3);
  	assertThat(newGeneratedTeams)
  		.extracting("teamNumber", Integer.class)
  		.containsExactly(10, 11, 12);
  	
   	assertThat(result.isDinnerRouteMessagesAlreadySent()).isFalse();
   	assertThat(result.isTeamMessagesAlreadySent()).isTrue();
   	
   	for (int i = 0; i < 9; i++) {
   		checkTeamsAtIndexAreSame(allTeams, teamsBeforeGeneration, i);
   	}
   	
		assertActivityTypeContained(ActivityType.WAITINGLIST_TEAMS_GENERATED);
  }
	
	private static void checkTeamsAtIndexAreSame(List<Team> teamsAfterGeneration, List<Team> teamsBeforeGeneration, int index) {
		
   	assertThat(teamsAfterGeneration.get(index).getTeamMembersOrdered())
 		.containsExactlyElementsOf(teamsBeforeGeneration.get(index).getTeamMembersOrdered());
   	
   	assertThat(teamsAfterGeneration.get(index).getMealClass())
   		.isEqualTo(teamsBeforeGeneration.get(index).getMealClass());
	}
  
  @Test
  public void emptyWaitingList() {
  	
  	setupRunningDinnerWithParticipants(18);
  	
  	WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
  	assertThat(waitingListData.getPossibleActions()).isEmpty();
  	assertThat(waitingListData.getNumMissingParticipantsForFullTeamArrangement()).isEqualTo(6);
  	assertThat(waitingListData.getParticiptantsForTeamArrangement()).isEmpty();
  	assertThat(waitingListData.getRemainingParticipants()).isEmpty();
  	assertThat(waitingListData.getTeamsWithCancelStatusOrCancelledMembers()).isEmpty();
  	assertThat(waitingListData.getTotalNumberOfMissingTeamMembers()).isZero();
  }
  
  @Test
  public void waitingListWithNotEnoughParticipantsForTeamGeneration() {
  	
  	setupRunningDinnerWithParticipants(18 + 4); // 4 on waitinglist
   	
  	WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
  	assertThat(waitingListData.getPossibleActions()).containsExactly(WaitingListAction.DISTRIBUTE_TO_TEAMS);
  	assertThat(waitingListData.getNumMissingParticipantsForFullTeamArrangement()).isEqualTo(2);
  	assertThat(waitingListData.getParticiptantsForTeamArrangement()).isEmpty();
  	assertThat(waitingListData.getRemainingParticipants()).hasSize(4);
  	assertThat(waitingListData.getTeamsWithCancelStatusOrCancelledMembers()).isEmpty();
  	assertThat(waitingListData.getTotalNumberOfMissingTeamMembers()).isZero();
  }
  
  @Test
  public void waitingListWithExactMatchingParticipantSizeForTeamGeneration() {
  	
  	setupRunningDinnerWithParticipants(18);
  	
  	addParticipants(6, 18);
   	
  	WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
  	assertThat(waitingListData.getPossibleActions()).containsExactly(WaitingListAction.GENERATE_NEW_TEAMS);
  	assertThat(waitingListData.getNumMissingParticipantsForFullTeamArrangement()).isEqualTo(0);
  	assertThat(waitingListData.getParticiptantsForTeamArrangement()).hasSize(6);
  	assertThat(waitingListData.getRemainingParticipants()).isEmpty();
  	assertThat(waitingListData.getTeamsWithCancelStatusOrCancelledMembers()).isEmpty();
  	assertThat(waitingListData.getTotalNumberOfMissingTeamMembers()).isZero();
  }
  
  @Test
  public void waitingListExceedingParticipantSizeForTeamGeneration() {
  	
  	setupRunningDinnerWithParticipants(18);
  	
  	addParticipants(8, 18);
   	
  	WaitingListData waitingListData = waitingListService.findWaitingListData(adminId);
  	assertThat(waitingListData.getPossibleActions()).containsExactly(WaitingListAction.GENERATE_NEW_TEAMS);
  	assertThat(waitingListData.getNumMissingParticipantsForFullTeamArrangement()).isEqualTo(4);
  	assertThat(waitingListData.getParticiptantsForTeamArrangement()).hasSize(6);
  	assertThat(waitingListData.getRemainingParticipants()).hasSize(2);
  	assertThat(waitingListData.getTeamsWithCancelStatusOrCancelledMembers()).isEmpty();
  	assertThat(waitingListData.getTotalNumberOfMissingTeamMembers()).isZero();
  }
  
  private void setupRunningDinnerWithParticipants(int numParticipantsToSetup) {

    runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, numParticipantsToSetup);
    adminId = runningDinner.getAdminId();
		teamService.createTeamAndVisitationPlans(adminId);
  }

  private TeamParticipantsAssignmentTO newTeamParticipantsAssignment(Team team, Participant...participants) {
  	
  	TeamParticipantsAssignmentTO result = new TeamParticipantsAssignmentTO();
  	result.setTeamId(team.getId());
  	result.setParticipantIds(new ArrayList<>(IdentifierUtil.getIds(Arrays.asList(participants))));
  	return result;
  }
  
  private void addParticipants(int numParticipantsToGenerate, int participantOffsetIndex) {
  	
	ParticipantGenerator
	  .generateParticipants(numParticipantsToGenerate, participantOffsetIndex)
	  .forEach(p -> participantService.addParticipant(runningDinner, new ParticipantInputDataTO(p), false));
  }

  private void sendTeamMessages() {
    TeamMessage msg = new TeamMessage();
    msg.setMessage("Message");
    msg.setSubject("Subject");
    msg.setHostMessagePartTemplate("Foo");
    msg.setNonHostMessagePartTemplate("Bar");
    msg.setTeamSelection(TeamSelection.ALL);
    MessageJob messageJob = messageService.sendTeamMessages(runningDinner.getAdminId(), msg);
    assertThat(messageJob).isNotNull();
    
    testHelperService.awaitMessageJobFinished(messageJob);
	}
  
  private void assertActivityTypeContained(ActivityType expectedActivityType) {
  	
    List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
    assertThat(activities)
    	.extracting("activityType", ActivityType.class)
    	.contains(expectedActivityType);
  }
  
}
