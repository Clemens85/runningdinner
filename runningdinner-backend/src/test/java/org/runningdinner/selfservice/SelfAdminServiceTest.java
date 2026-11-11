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
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.exception.ValidationException;
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
  public void testUpdateTeamName() {

    Team updatedTeam = selfAdminService.updateTeamName(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId(), "  Die   Gourmets ");
    assertThat(updatedTeam.getTeamName()).isEqualTo("Die Gourmets");

    SelfAdminTeamNameInfoTO info = selfAdminService.findTeamNameInfo(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId());
    assertThat(info.getTeamName()).isEqualTo("Die Gourmets");
    assertThat(info.isTeamNameChangeAllowed()).isTrue();

    List<Activity> activities = activityService.findActivitiesByTypes(runningDinner.getAdminId(), ActivityType.PARTICIPANT_CHANGED_TEAMNAME);
    assertThat(activities).hasSize(1);
    assertThat(activities.get(0).getActivityMessage()).contains("Team " + team.getTeamNumber());

    selfAdminService.updateTeamName(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId(), "");
    assertThat(teamService.findTeamById(runningDinner.getAdminId(), team.getId()).getTeamName()).isNull();
  }

  @Test
  public void testUpdateTeamNameInvalid() {

    ValidationException e = Assertions.assertThrows(ValidationException.class,
        () -> selfAdminService.updateTeamName(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId(), "<b>Bad</b>"));
    assertThat(e.getIssues().getIssues().get(0).getField()).isEqualTo("teamName");
  }

  @Test
  public void testUpdateTeamNameBlockedAfterDinnerRouteMailsSent() {

    sendDinnerRouteMessages();

    ValidationException e = Assertions.assertThrows(ValidationException.class,
        () -> selfAdminService.updateTeamName(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId(), "Too Late"));
    assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.TEAM_NAME_CHANGE_NOT_ALLOWED_ROUTES_SENT);

    SelfAdminTeamNameInfoTO info = selfAdminService.findTeamNameInfo(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), team.getId());
    assertThat(info.isTeamNameChangeAllowed()).isFalse();
    assertThat(teamService.findTeamById(runningDinner.getAdminId(), team.getId()).getTeamName()).isNull();

    // Admins are not restricted
    Team updatedByAdmin = teamService.updateTeamName(runningDinner.getAdminId(), team.getId(), "Admin Choice");
    assertThat(updatedByAdmin.getTeamName()).isEqualTo("Admin Choice");
  }

  @Test
  public void testUpdateTeamNameNotAllowedForParticipantOfOtherTeam() {

    TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(runningDinner.getAdminId(), team.getId());
    Team otherTeam = teamMeetingPlan.getGuestTeams().get(0);

    Assertions.assertThrows(IllegalArgumentException.class,
        () -> selfAdminService.updateTeamName(runningDinner.getSelfAdministrationId(), executingParticipant.getId(), otherTeam.getId(), "Hijacked"));
    assertThat(teamService.findTeamById(runningDinner.getAdminId(), otherTeam.getId()).getTeamName()).isNull();
  }

  @Test
  public void testTeamMessageContainsManageTeamNameLink() {

    TeamMessage msg = new TeamMessage();
    msg.setSubject("Subject");
    msg.setMessage("Name link: {managenamelink}");
    msg.setHostMessagePartTemplate("Host part");
    msg.setNonHostMessagePartTemplate("NonHost part");
    msg.setTeamSelection(TeamSelection.ALL);
    MessageJob messageJob = messageService.sendTeamMessages(runningDinner.getAdminId(), msg);
    testHelperService.awaitMessageJobFinished(messageJob);

    List<MessageTask> messageTasks = messageService.findMessageTasks(runningDinner.getAdminId(), messageJob.getId());
    assertThat(messageTasks).isNotEmpty();
    for (MessageTask messageTask : messageTasks) {
      assertThat(messageTask.getMessage().getContent())
        .contains("/teamname/")
        .doesNotContain("{managenamelink}");
    }
  }

  private void sendDinnerRouteMessages() {

    DinnerRouteMessage msg = new DinnerRouteMessage();
    msg.setMessage("{route}");
    msg.setSubject("Dinner Route");
    msg.setHostsTemplate("Hosts");
    msg.setSelfTemplate("Self");
    msg.setTeamSelection(TeamSelection.ALL);
    MessageJob messageJob = messageService.sendDinnerRouteMessages(runningDinner.getAdminId(), msg);
    testHelperService.awaitMessageJobFinished(messageJob);
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