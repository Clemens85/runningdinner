package org.runningdinner.admin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.deleted.DeletedRunningDinner;
import org.runningdinner.admin.deleted.DeletedRunningDinnerRepository;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.stats.MessageSenderHistoryRepository;
import org.runningdinner.admin.rest.BasicSettingsTO;
import org.runningdinner.contract.Contract;
import org.runningdinner.contract.ContractService;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestMessageTaskHelperService;
import org.runningdinner.test.util.TestUtil;
import org.runningdinner.wizard.PublicSettingsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class RunningDinnerDeletionTest {
  
  private static final LocalDateTime DINNER_DATE = LocalDateTime.now().plusDays(10); 

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private TestMessageTaskHelperService testMessageTaskHelperService;

  @Autowired
  private TeamService teamService;
  
  @Autowired
  private TeamRepository teamRepository;

  @Autowired
  private ParticipantRepository participantRepository;

  @Autowired
  private ActivityService activityService;
  
  @Autowired
  private ContractService contractService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private RunningDinnerRepository runningDinnerRepository;
  
  @Autowired
  private DeleteOldRunningDinnersSchedulerService deleteOldRunningDinnersSchedulerService;
  
  @Autowired
  private DeletedRunningDinnerRepository deletedRunningDinnerRepository;
  
  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;

  @Autowired
  private MessageTaskRepository messageTaskRepository;

  @Autowired
  private MessageSenderHistoryRepository messageSenderHistoryRepository;

  private RunningDinner runningDinner;

  @BeforeEach
  public void setUp() throws NoPossibleRunningDinnerException {
    runningDinner = testHelperService.createClosedRunningDinner(DINNER_DATE.toLocalDate(), CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    testMessageTaskHelperService.clearHistoricalMessageTasks();
  }

  @Test
  public void deleteDinnerThatIsExpired() {
    
    assertExistingRunningDinnerEntities();
    
    Contract contract = contractService.findContractByRunningDinner(runningDinner);
    assertThat(contract).isNotNull();
    assertThat(contract.getParentRunningDinnerId()).isEqualTo(runningDinner.getId());
    assertThat(contract.getParentDeletedRunningDinnerId()).isNull();
    
    LocalDateTime now = DINNER_DATE.plusDays(6);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    assertNoRunningDinnerEntities();
    
    contract = contractService.findContractById(contract.getId());

    assertThat(contract).isNotNull();
    assertThat(contract.getParentRunningDinnerId()).isNull();
    assertThat(contract.getParentDeletedRunningDinnerId()).isNotNull();
  }
  
  @Test
  public void deleteDinnerThatIsNotYetExpired() {
    
    assertExistingRunningDinnerEntities();
    
    LocalDateTime now = DINNER_DATE;
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    assertExistingRunningDinnerEntities();
  }
  
  @Test
  public void deleteCancelledDinner() {
    
    assertExistingRunningDinnerEntities();
    
    LocalDateTime cancellationDate = DINNER_DATE;
    runningDinnerService.cancelRunningDinner(runningDinner.getAdminId(), cancellationDate);

    LocalDateTime now = DINNER_DATE.plusDays(5);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    assertNoRunningDinnerEntities();
  }
  
  
  @Test
  public void publicSettingsAreCopiedToDeletedRunningDinner() {
    
    // Make dinner public:
    runningDinner = changeClosedToPublic();
    
    LocalDateTime cancellationDate = DINNER_DATE;
    runningDinnerService.cancelRunningDinner(runningDinner.getAdminId(), cancellationDate);

    LocalDateTime now = DINNER_DATE.plusDays(5);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    List<DeletedRunningDinner> deletedRunningDinners = assertNoRunningDinnerEntities();
    Optional<DeletedRunningDinner> deletedRunningDinner = deletedRunningDinners
                                                            .stream()
                                                            .filter(drd -> drd.getEmail().equals(runningDinner.getEmail()))
                                                            .findFirst();
    assertThat(deletedRunningDinner).isPresent();
    PublicSettings archivedPublicSettings = deletedRunningDinner.get().getPublicSettings();
    
    assertThat(archivedPublicSettings).isEqualToComparingOnlyGivenFields(runningDinner.getPublicSettings(), "publicTitle", "publicDescription", "endOfRegistrationDate");
  }
  
  @Test
  public void deleteWithTeamPartnerRegistration() {
    
    this.runningDinner = changeClosedToPublic();
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", TestUtil.newAddress(), 6);
    registrationData.setTeamPartnerWishRegistrationData(TestUtil.newTeamPartnerWithRegistrationData("Maria", "Musterfrau"));
    
    RegistrationSummary rs = frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, false);
    assertThat(rs).isNotNull();
    assertThat(rs.getParticipant()).isNotNull();
    
    List<Participant> participants = participantRepository.findByAdminIdOrderByParticipantNumber(runningDinner.getAdminId());
    assertThat(participants).hasSize(20);
    assertThat(participants.get(18).getTeamPartnerWishOriginatorId()).isNotNull();
    assertThat(participants.get(19).getTeamPartnerWishOriginatorId()).isNotNull();

    // Verify that existed MessageTask entities get later on copied to the history version
    List<MessageTask> messageTasksToBeDeleted = messageTaskRepository.findByAdminId(runningDinner.getAdminId());
    assertThat(messageTasksToBeDeleted).isNotEmpty();
    assertThat(messageSenderHistoryRepository.count()).isZero();

    LocalDateTime now = DINNER_DATE.plusDays(6);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);

    assertThat(messageSenderHistoryRepository.count()).isEqualTo(messageTasksToBeDeleted.size());
    
    assertNoRunningDinnerEntities();
  }

  private RunningDinner changeClosedToPublic() {
    runningDinner = assertExistingRunningDinnerEntities();
    runningDinner.setEmail(UUID.randomUUID() + "@mail.de"); // Used later on for identifying this dinner
    runningDinner = runningDinnerRepository.save(runningDinner);
    
    BasicSettingsTO basicSettings = TestUtil.newBasicSettings(TestUtil.newBasicDetails(runningDinner.getTitle(),
        runningDinner.getDate(), runningDinner.getCity(), RegistrationType.PUBLIC));    
    runningDinner = runningDinnerService.updateBasicSettings(runningDinner.getAdminId(), basicSettings);
    
    PublicSettings publicSettings = new PublicSettings("publicTitle", "publicDescription", runningDinner.getDate().minusDays(1), false); 
    runningDinner = runningDinnerService.updatePublicSettings(runningDinner.getAdminId(), new PublicSettingsTO(publicSettings, false));
    return runningDinner;
  }
  
  private RunningDinner assertExistingRunningDinnerEntities() {
    
    List<Activity> activities = activityService.findActivityStream(runningDinner);
    List<Participant> participants = participantRepository.findByAdminId(runningDinner.getAdminId()); 
    long numberOfTeams = teamRepository.countByAdminId(runningDinner.getAdminId()); 
    
    assertThat(numberOfTeams).isGreaterThan(0);
    assertThat(participants.size()).isGreaterThan(0);
    assertThat(activities.size()).isGreaterThan(0);
    
    Optional<RunningDinner> foundRunningDinner = runningDinnerRepository.findById(runningDinner.getId());
    assertThat(foundRunningDinner).isPresent();
    return foundRunningDinner.orElseThrow(IllegalStateException::new);
  }
  
  private List<DeletedRunningDinner> assertNoRunningDinnerEntities() {
    
    List<Activity> activities = activityService.findActivityStream(runningDinner);
    List<Participant> participants = participantRepository.findByAdminId(runningDinner.getAdminId()); 
    long numberOfTeams = teamRepository.countByAdminId(runningDinner.getAdminId()); 
    
    assertThat(activities).isEmpty();
    assertThat(numberOfTeams).isZero();
    assertThat(participants).isEmpty();
    
    assertThat(runningDinnerRepository.findById(runningDinner.getId())).isNotPresent();
    
    List<DeletedRunningDinner> allDeletedRunningDinners = deletedRunningDinnerRepository.findAll();
    List<DeletedRunningDinner> foundDeletedDinners = allDeletedRunningDinners
      .stream()
      .filter(deletedRunningDinner -> deletedRunningDinner.getDate().equals(runningDinner.getDate()))
      .filter(deletedRunningDinner -> deletedRunningDinner.getEmail().equals(runningDinner.getEmail()))
      .collect(Collectors.toList());
    
    assertThat(foundDeletedDinners).isNotEmpty();
    return foundDeletedDinners;
  }
  
}
