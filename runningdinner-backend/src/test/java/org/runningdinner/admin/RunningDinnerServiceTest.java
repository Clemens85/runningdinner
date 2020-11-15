
package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import static org.junit.Assert.assertEquals;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.EntityManagerFactory;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.core.GenderAspect;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.RunningDinnerInfo;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.HostTeamInfo;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.runningdinner.wizard.BasicDetailsTO;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class RunningDinnerServiceTest {

  private static final int DINNER_NUM_PARTICIPANTS = 22;

  private static final String DINNER_EMAIL = "email@email.de";
  private static final String DINNER_TITLE = "title";
  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7);

  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;

  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;

  @Autowired
  private ActivityService activityService;

  @Autowired
  private TeamService teamService;
  
  @Autowired
  private ParticipantService participantService;

  @Autowired
  private EntityManagerFactory entityManagerFactory;

  @Test
  public void testCreateRunningDinner() {

    RunningDinner runningDinner = createDefaultRunningDinner();

    assertThat(runningDinner).isNotNull();
    assertThat(runningDinner.getAdminId()).isNotEmpty();
    assertThat(runningDinner.getEmail()).isEqualTo(DINNER_EMAIL);

    assertThat(activityService.findActivityStream(runningDinner)).extracting("activityType").contains(ActivityType.DINNER_CREATED);
  }

  private RunningDinner createDefaultRunningDinner() {

    RunningDinnerInfo info = TestUtil.newBasicDetails(DINNER_TITLE, DINNER_DATE, "Freiburg");
    RunningDinnerConfig runningDinnerConfig = RunningDinnerConfig.newConfigurer().havingMeals(TestHelperService.newDefaultMeals(DINNER_DATE)).build();
    
    List<Participant> participants = ParticipantGenerator.generateParticipants(DINNER_NUM_PARTICIPANTS);
    return createRunningDinnerWizardService.createRunningDinnerWithParticipants(info, runningDinnerConfig, DINNER_EMAIL, RunningDinnerType.STANDARD, 
                                                                                CreateRunningDinnerInitializationService.createContract(), participants);
  }

  
  @Test
  public void testGetRunningDinnerByUuid() {

    String dinnerAdminId = createDefaultRunningDinner().getAdminId();

    entityManagerFactory.getCache().evictAll();

    RunningDinner result = runningDinnerService.findRunningDinnerByAdminId(dinnerAdminId);
    assertThat(result.getTitle()).isEqualTo(DINNER_TITLE);
    assertThat(result.getEmail()).isEqualTo(DINNER_EMAIL);
    assertThat(result.getConfiguration().getTeamSize()).isEqualTo(2);
    assertThat(result.getConfiguration().getGenderAspects()).isSameAs(GenderAspect.IGNORE_GENDER);
    assertThat(result.getConfiguration().isForceEqualDistributedCapacityTeams()).isTrue();
    assertThat(result.getConfiguration().getMealClasses()).hasSize(3);
  }

  @Test
  public void testPersistGeneratedTeams()
    throws NoPossibleRunningDinnerException {

    String dinnerAdminId = createDefaultRunningDinner().getAdminId();

    teamService.createTeamAndVisitationPlans(dinnerAdminId);
    entityManagerFactory.getCache().evictAll();

    // With 22 participants just 9 regular teams (with 2 members for each team) can be built up (->RunningDinnerCalculator)
    // 4 participants cannot be assigned to regular teams then
    assertThat(teamService.getNumberOfTeams(dinnerAdminId)).isEqualTo(9);
  }

  @Test
  public void testGetTeamsForDinner()
    throws NoPossibleRunningDinnerException {

    String dinnerAdminId = createDefaultRunningDinner().getAdminId();
    teamService.createTeamAndVisitationPlans(dinnerAdminId);
    entityManagerFactory.getCache().evictAll();

    List<Team> teams = teamService.findTeamArrangements(dinnerAdminId, false);
    assertThat(teams).hasSize(9);

    // Check teams are correctly ordered
    assertThat(teams).extracting("teamNumber").containsExactly(1, 2, 3, 4, 5, 6, 7, 8, 9);
    assertThat(teams).extracting("mealClass").doesNotContainNull();

    for (Team team : teams) {
      assertThat(team.getTeamMembers()).as("Expecting team member size of team " + team.getTeamNumber() + " to be 2").hasSize(2);
      // Check both team members for having successfully retrieved some persistent values:
      List<ParticipantAddress> addresses = team.getTeamMembers().stream().map(p -> p.getAddress()).collect(Collectors.toList());
      assertThat(addresses).as("Expecting streets of team members of team " + team.getTeamNumber() + " to be 'MyStreet'").extracting(
        "street").containsExactly("MyStreet", "MyStreet");
    }
  }

  @Test
  public void testTeamMeetingPlan()
    throws NoPossibleRunningDinnerException {

    String dinnerAdminId = createDefaultRunningDinner().getAdminId();
    teamService.createTeamAndVisitationPlans(dinnerAdminId);

    List<Team> teams = teamService.findTeamArrangements(dinnerAdminId, false);

    Team teamUnderTest = teams.get(0);

    TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(dinnerAdminId, teamUnderTest.getId());
    assertEquals(teamUnderTest, teamMeetingPlan.getTeam());
    assertThat(teamMeetingPlan.getGuestTeams()).hasSize(2);
    assertThat(teamMeetingPlan.getHostTeams()).hasSize(2);

    Set<Team> allMeetedTeams = new HashSet<Team>(teamMeetingPlan.getGuestTeams());

    for (HostTeamInfo hostTeam : teamMeetingPlan.getHostTeams()) {
      allMeetedTeams.add(hostTeam.getTeam());

      List<Team> meetedTeams = hostTeam.getMeetedTeams();
      assertEquals(1, meetedTeams.size());

      allMeetedTeams.add(meetedTeams.get(0));
    }

    assertEquals(6, allMeetedTeams.size());
  }

  @Test
  public void testUpdateMealTimesWithCorrectSorting() {

    LocalDate dinnerDate = LocalDate.now().plusYears(1).withDayOfYear(1); 

    BasicDetailsTO basicDetails = TestUtil.newBasicDetails(DINNER_TITLE, dinnerDate, "Freiburg");
    
    LocalDateTime seven = LocalDateTime.of(dinnerDate, LocalTime.of(19, 0));
    LocalDateTime nine = LocalDateTime.of(dinnerDate, LocalTime.of(21, 0));
    LocalDateTime eleven = LocalDateTime.of(dinnerDate, LocalTime.of(23, 0));
    
    Collection<MealClass> meals = Arrays.asList(new MealClass("Vor", seven), new MealClass("Haupt", nine), new MealClass("Nach", eleven));
    RunningDinnerConfig runningDinnerConfig = RunningDinnerConfig.newConfigurer().havingMeals(meals).build();

    List<Participant> participants = ParticipantGenerator.generateParticipants(DINNER_NUM_PARTICIPANTS);
    RunningDinner result = createRunningDinnerWizardService.createRunningDinnerWithParticipants(basicDetails, runningDinnerConfig, DINNER_EMAIL, RunningDinnerType.STANDARD, 
                                                                                                CreateRunningDinnerInitializationService.createContract(), participants);

    assertThat(result.getConfiguration().getMealClasses()).extracting("label").containsExactly("Vor", "Haupt", "Nach");

    result.getConfiguration().getMealClasses().get(0).setTime(nine.withMinute(30));
    result.getConfiguration().getMealClasses().get(1).setTime(seven.withMinute(30));
    runningDinnerService.updateMealTimes(result.getAdminId(), result.getConfiguration().getMealClasses());

    RunningDinner updatedRunningDinner = runningDinnerService.findRunningDinnerByAdminId(result.getAdminId());
    assertThat(updatedRunningDinner.getConfiguration().getMealClasses()).extracting("label").containsExactly("Haupt", "Vor", "Nach");

  }
  
  @Test
  public void testUpdateBasicDetails() {
    
    RunningDinner runningDinner = createDefaultRunningDinner();
    // Assure existing values
    String unmodifiedZip = runningDinner.getZip();
    assertThat(runningDinner.getRegistrationType()).isEqualTo(RegistrationType.CLOSED);
    assertThat(runningDinner.getPublicSettings().getPublicId()).isNull();
    assertThat(runningDinner.getPublicSettings().getPublicDinnerUrl()).isNull();
    assertThat(runningDinner.getPublicSettings().getEndOfRegistrationDate()).isNull();
    assertThat(runningDinner.getDate()).isEqualTo(DINNER_DATE);
    // Verify existing meals are all on dinner-date's date:
    List<MealClass> meals = runningDinner.getConfiguration().getMealClasses();
    assertThat(meals)
      .extracting("time", LocalDateTime.class)
      .allMatch(mealTime -> mealTime.toLocalDate().isEqual(DINNER_DATE));
    
    LocalDate updatedDinnerDate = DINNER_DATE.plusDays(20);
    BasicDetailsTO basicDetailsToUpdate = TestUtil.newBasicDetails("New Title", updatedDinnerDate, "Neustadt", RegistrationType.OPEN);
    
    // Assure updated values
    
    runningDinnerService.updateBasicSettings(runningDinner.getAdminId(), TestUtil.newBasicSettings(basicDetailsToUpdate));
    // Reload from DB to assure that changes are really persisted:
    RunningDinner updatedRunningDinner = runningDinnerService.findRunningDinnerByAdminId(runningDinner.getAdminId());
    assertThat(updatedRunningDinner.getCity()).isEqualTo("Neustadt");
    assertThat(updatedRunningDinner.getTitle()).isEqualTo("New Title");
    assertThat(updatedRunningDinner.getDate()).isEqualTo(updatedDinnerDate);  
    assertThat(updatedRunningDinner.getZip()).isEqualTo(unmodifiedZip);
    // Assure public settings are also created (due to switch):
    assertThat(updatedRunningDinner.getRegistrationType()).isEqualTo(RegistrationType.OPEN);
    assertThat(updatedRunningDinner.getPublicSettings().getPublicId()).isNotEmpty();
    assertThat(updatedRunningDinner.getPublicSettings().getPublicDinnerUrl()).isNotEmpty();
    assertThat(updatedRunningDinner.getPublicSettings().getEndOfRegistrationDate()).isEqualTo(updatedDinnerDate.minusDays(7)); // Default end of regisrtration is 7 days before dinner date
    
    // Assure meals are also updated:
    meals = updatedRunningDinner.getConfiguration().getMealClasses();
    assertThat(meals)
      .extracting("time", LocalDateTime.class)
      .allMatch(mealTime -> mealTime.toLocalDate().isEqual(updatedDinnerDate));
    
    assertThat(activityService.findActivityStream(updatedRunningDinner)).extracting("activityType").contains(ActivityType.CUSTOM_ADMIN_CHANGE);
    
    // Switch back to closed dinner and assure that public settings are NOT removed (but kept, just for case if user decides later on to switch back again):
    basicDetailsToUpdate = TestUtil.newBasicDetails("New Title", updatedDinnerDate, "Neustadt", RegistrationType.CLOSED);
    runningDinnerService.updateBasicSettings(runningDinner.getAdminId(), TestUtil.newBasicSettings(basicDetailsToUpdate));
    updatedRunningDinner = runningDinnerService.findRunningDinnerByAdminId(runningDinner.getAdminId());
    assertThat(updatedRunningDinner.getRegistrationType()).isEqualTo(RegistrationType.CLOSED);
    assertThat(updatedRunningDinner.getPublicSettings().getPublicId()).isNotEmpty();
    assertThat(updatedRunningDinner.getPublicSettings().getPublicDinnerUrl()).isNotEmpty();
    assertThat(updatedRunningDinner.getPublicSettings().getEndOfRegistrationDate()).isEqualTo(updatedDinnerDate.minusDays(7)); // Default end of regisrtration is 7 days before dinner date
  }
  
  @Test
  public void testRegistrationDeactivation() {
    
    RunningDinner dinner = createDefaultRunningDinner();
    // Switch to public dinner
    BasicDetailsTO basicDetails = TestUtil.newBasicDetails(dinner.getTitle(), dinner.getDate(), dinner.getCity(), RegistrationType.PUBLIC);
    dinner = runningDinnerService.updateBasicSettings(dinner.getAdminId(), TestUtil.newBasicSettings(basicDetails));
  
    dinner = runningDinnerService.updateRegistrationActiveState(dinner.getAdminId(), false);
    
    List<Activity> activities = activityService.findAdministrationActivityStream(dinner);
    boolean activityFound = activities
                              .stream()
                              .map(Activity::getActivityMessage)
                              .anyMatch(message -> message.contains("deaktiviert"));
    
    assertThat(activityFound).as("Expected activity to be found for registration deactivation").isTrue();
    
    try {
      frontendRunningDinnerService.performRegistration(dinner.getPublicSettings().getPublicId(), newRegistationData(), false);
      Assert.fail("Expected registration to be not possible!");
    } catch (IllegalStateException ex) {
      // NOP
    }
    
    // Ensure that manual participant creation is still possible:
    Participant participant = participantService.addParticipant(dinner.getAdminId(), ParticipantGenerator.generateParticipant(30));
    assertThat(participant).isNotNull();
    assertThat(participant.getActivationDate()).isNotNull();
    
    // Activate registration again:
    dinner = runningDinnerService.updateRegistrationActiveState(dinner.getAdminId(), true);
    RegistrationSummary result = frontendRunningDinnerService.performRegistration(dinner.getPublicSettings().getPublicId(), newRegistationData(), false);
    assertThat(result).isNotNull();
  }
  
  private RegistrationDataTO newRegistationData() {
    
    ParticipantAddress address = ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 12345 Musterstadt");
    return TestUtil.createRegistrationData("Max Mustermann", "max@max.de", address, 6);
  }
}
