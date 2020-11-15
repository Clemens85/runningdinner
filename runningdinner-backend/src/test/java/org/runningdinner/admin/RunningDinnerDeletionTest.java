package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.deleted.DeletedRunningDinner;
import org.runningdinner.admin.deleted.DeletedRunningDinnerRepository;
import org.runningdinner.contract.Contract;
import org.runningdinner.contract.ContractService;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.TeamRepository;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.wizard.PublicSettingsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class RunningDinnerDeletionTest {
  
  private static final LocalDateTime DINNER_DATE = LocalDateTime.now().plusDays(10); 

  @Autowired
  private TestHelperService testHelperService;

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

  private RunningDinner runningDinner;

  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    runningDinner = testHelperService.createClosedRunningDinner(DINNER_DATE.toLocalDate(), CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
  }

  @Test
  public void deleteDinnerThatIsExpired() {
    
    assertExistingRunningDinnerEntities();
    
    Contract contract = contractService.findContractByRunningDinner(runningDinner);
    assertThat(contract).isNotNull();
    assertThat(contract.getParentRunningDinnerId()).isEqualTo(runningDinner.getId());
    assertThat(contract.getParentDeletedRunningDinnerId()).isNull();
    
    LocalDateTime now = DINNER_DATE.plusDays(3);
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

    LocalDateTime now = DINNER_DATE.plusDays(3);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    assertNoRunningDinnerEntities();
  }
  
  
  @Test
  public void publicSettingsAreCopiedToDeletedRunningDinner() {
    
    // Make dinner public:
    runningDinner = assertExistingRunningDinnerEntities();
    runningDinner.setRegistrationType(RegistrationType.PUBLIC);
    String uniqueEmail = UUID.randomUUID().toString() + "@mail.de"; // Used later on for identifying this dinner
    runningDinner.setEmail(uniqueEmail);
    runningDinner = runningDinnerRepository.save(runningDinner);
    PublicSettings publicSettings = new PublicSettings("publicTitle", "publicDescription", runningDinner.getDate().minusDays(1), false); 
    runningDinnerService.updatePublicSettings(runningDinner.getAdminId(), new PublicSettingsTO(publicSettings, false));
    
    LocalDateTime cancellationDate = DINNER_DATE;
    runningDinnerService.cancelRunningDinner(runningDinner.getAdminId(), cancellationDate);

    LocalDateTime now = DINNER_DATE.plusDays(3);
    deleteOldRunningDinnersSchedulerService.deleteOldRunningDinnerInstances(now);
    
    List<DeletedRunningDinner> deletedRunningDinners = assertNoRunningDinnerEntities();
    Optional<DeletedRunningDinner> deletedRunningDinner = deletedRunningDinners
                                                            .stream()
                                                            .filter(drd -> drd.getEmail().equals(uniqueEmail))
                                                            .findFirst();
    assertThat(deletedRunningDinner).isPresent();
    PublicSettings archivedPublicSettings = deletedRunningDinner.get().getPublicSettings();
    
    assertThat(archivedPublicSettings).isEqualToComparingOnlyGivenFields(publicSettings, "publicTitle", "publicDescription", "endOfRegistrationDate");
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
