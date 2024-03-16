package org.runningdinner.selfservice;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;


@ExtendWith(SpringExtension.class)
@ApplicationTest
public class SelfAdminServiceTest {

  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7); 

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private TeamService teamService;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private MessageService messageService;

  @Autowired
  private ActivityService activityService;
  
  @Autowired
  private SelfAdminService selfAdminService;

  private RunningDinner runningDinner;

  private Participant executingParticipant;

  private List<Participant> participants;

  private Team team;

  @BeforeEach
  public void setUp() throws NoPossibleRunningDinnerException {

    runningDinner = testHelperService.createClosedRunningDinner(DINNER_DATE, CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    executingParticipant = participants.get(0);
    
    team = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), executingParticipant.getTeamId());
  }
  
  @Test
  public void testChangeTeamHost() {
    
    Participant nonHostingTeamMemberBeforeUpdate = team.getTeamMembers().stream().filter(p -> !p.isHost()).findAny().get();
    
    assertThat(team.getHostTeamMember()).isNotEqualTo(nonHostingTeamMemberBeforeUpdate);
    
    ChangeTeamHost changeTeamHost = newChangeTeamHost(nonHostingTeamMemberBeforeUpdate.getId());
    Team updatedTeam = selfAdminService.changeTeamHost(runningDinner.getSelfAdministrationId(), changeTeamHost);
    assertThat(updatedTeam.getHostTeamMember()).isEqualTo(nonHostingTeamMemberBeforeUpdate);

    List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
    List<Activity> customAdminChanges = activities.stream().filter(a -> a.getActivityType() == ActivityType.CUSTOM_ADMIN_CHANGE).collect(Collectors.toList());
    List<Activity> specificAdminChanges = activities.stream().filter(a -> a.getActivityType() != ActivityType.CUSTOM_ADMIN_CHANGE).collect(Collectors.toList());

    assertThat(specificAdminChanges)
    .extracting("activityType", ActivityType.class)
    .containsOnly(ActivityType.DINNER_CREATED, ActivityType.TEAM_ARRANGEMENT_CREATED, ActivityType.PARTICIPANT_CHANGED_TEAMHOST);
    
    assertThat(customAdminChanges).isEmpty();
    
    List<MessageJob> messageJobs = messageService.findMessageJobs(runningDinner.getAdminId(), MessageType.TEAM_HOST_CHANGED_BY_PARTICIPANT);
    assertThat(messageJobs).hasSize(1);

    List<MessageTask> messageTasks = messageService.findMessageTasks(runningDinner.getAdminId(), messageJobs.get(0).getId());
    assertThat(messageTasks).hasSize(1);
    assertThat(messageTasks.get(0).getMessage().getContent()).contains("MyComment");
  }
  
  @Test
  public void testFindTeamNotAllowedForDifferentTeam() {
    
    TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(runningDinner.getAdminId(), team.getId());
    Team otherTeam = teamMeetingPlan.getGuestTeams().get(0);

    try {
      selfAdminService.findTeam(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), otherTeam.getId());
      Assertions.fail("Expected exception to be thrown");
    } catch (IllegalArgumentException e) {
      Assertions.assertTrue(true);
    }
  }
  
  private ChangeTeamHost newChangeTeamHost(UUID newTeamHostId) {
    
    ChangeTeamHost result = new ChangeTeamHost();
    result.setComment("MyComment");
    result.setParticipantId(executingParticipant.getId());
    result.setTeamId(executingParticipant.getTeamId());
    result.setNewHostingTeamMemberId(newTeamHostId);
    return result;
  }
  
}