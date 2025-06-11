package org.runningdinner.admin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class TeamSwapMassTest {

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

	@BeforeEach
	public void setUp() throws NoPossibleRunningDinnerException {
		runningDinner = testHelperService.createClosedRunningDinner(DINNER_DATE, CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
		teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
	}

	@RepeatedTest(10)
	public void swapParticipantsWithEqualBalancedDistributedSeats() {
		// Distribute numSeats randomly:
		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), false);
		ParticipantGenerator.distributeSeatsEqualBalanced(participants, 6);
		participants.forEach(p -> testHelperService.updateParticipant(p));

		swapTeamMembersRandomly();
	}

	@RepeatedTest(10)
	public void swapParticipantsWithTooFewSeats() {
		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), false);
		participants.forEach(p -> {
			p.setNumSeats(1);
			testHelperService.updateParticipant(p);
		});
		swapTeamMembersRandomly();
	}

	@RepeatedTest(10)
	public void swapParticipantsWithEnoughSeats() {
		List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), false);
		participants.forEach(p -> {
			p.setNumSeats(10);
			testHelperService.updateParticipant(p);
		});
		swapTeamMembersRandomly();
	}


	private void swapTeamMembersRandomly() {
		List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), true);

		int randomIndex1 = (int) (Math.random() * teams.size());
		int randomIndex2 = (int) (Math.random() * teams.size());
		while (randomIndex1 == randomIndex2) {
			randomIndex2 = (int) (Math.random() * teams.size());
		}
		// Swap the teams at the two random indices
		Team team1 = teams.get(randomIndex1);
		Team team2 = teams.get(randomIndex2);

		int teamMemberIndex1 = (int) (Math.random() * 2);
		int teamMemberIndex2 = (int) (Math.random() * 2);

		var participantIdTeam1 = team1.getTeamMembersOrdered().get(teamMemberIndex1).getId();
		var participantIdTeam2 = team2.getTeamMembersOrdered().get(teamMemberIndex2).getId();

		teamService.swapTeamMembers(runningDinner.getAdminId(), participantIdTeam1, participantIdTeam2);

		teams = teamService.findTeamArrangements(runningDinner.getAdminId(), true);
		team1 = teams.get(randomIndex1);
		team2 = teams.get(randomIndex2);
		assertThat(team1.getHostTeamMember()).isNotNull();
		assertThat(team2.getHostTeamMember()).isNotNull();

	}
}
