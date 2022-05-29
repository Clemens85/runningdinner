package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.WaitingListService;
import org.runningdinner.participant.rest.TeamParticipantsAssignmentTO;
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
  
  private RunningDinner runningDinner;

	private String adminId;
  
  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    runningDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 26);
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    adminId = runningDinner.getAdminId();
  }
  
  @Test
  public void testAssignParticipantToTeamWithCancelledMember() {
  	
  	List<Team> teams = teamService.findTeamArrangements(adminId, true);
  	Team firstTeam = teams.get(0);
  	
  	Participant remainingParticipant = firstTeam.getTeamMembersOrdered().get(1);
  	firstTeam = teamService.cancelTeamMember(adminId, firstTeam.getId(), firstTeam.getTeamMembersOrdered().get(0).getId());
  	
  	assertThat(firstTeam.getTeamMembersOrdered()).hasSize(1);

		List<Participant> participantsOnWaitingList = participantService.findActiveParticipantsNotAssignedToTeam(adminId);
  	Participant firstParticipantOnWaitingList = participantsOnWaitingList.get(0);
		List<TeamParticipantsAssignmentTO> assignments = List.of(newTeamParticipantsAssignment(firstTeam, firstParticipantOnWaitingList));

		waitingListService.assignParticipantsToExistingTeams(adminId, assignments);
		
		firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeam.getId());
		assertThat(firstTeam.getTeamMembersOrdered()).hasSize(2);
		assertThat(firstTeam.getTeamMembersOrdered()).containsExactly(remainingParticipant, firstParticipantOnWaitingList);
		assertThat(firstTeam.getHostTeamMember()).isNotNull();
		assertThat(firstTeam.getStatus()).isEqualTo(TeamStatus.OK);
		
		firstParticipantOnWaitingList = participantService.findParticipantById(adminId, firstParticipantOnWaitingList.getId());
		assertThat(firstParticipantOnWaitingList.getTeamId()).isEqualTo(firstTeam.getId());
  }

  private TeamParticipantsAssignmentTO newTeamParticipantsAssignment(Team team, Participant...participants) {
  	
  	TeamParticipantsAssignmentTO result = new TeamParticipantsAssignmentTO();
  	result.setTeamId(team.getId());
  	result.setParticipantIds(new ArrayList<>(RepositoryUtil.getEntityIds(Arrays.asList(participants))));
  	return result;
  }
	
}
