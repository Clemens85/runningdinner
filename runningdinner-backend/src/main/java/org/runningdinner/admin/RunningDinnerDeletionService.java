package org.runningdinner.admin;

import org.runningdinner.admin.activity.ActivityRepository;
import org.runningdinner.admin.deleted.DeletedRunningDinner;
import org.runningdinner.admin.deleted.DeletedRunningDinnerRepository;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJobRepository;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.contract.ContractService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerPreferences;
import org.runningdinner.participant.*;
import org.runningdinner.payment.RegistrationOrderRepository;
import org.runningdinner.payment.paymentoptions.PaymentOptionsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RunningDinnerDeletionService {

  private static final int DAYS_TO_KEEP_OLD_DINNER = 5;

  private static final int DAYS_BEFORE_DELETION_TO_WARN = 2;

  private static final Logger LOGGER = LoggerFactory.getLogger(RunningDinnerDeletionService.class);

  @Autowired
  private RunningDinnerRepository runningDinnerRepository;

  @Autowired
  private RunningDinnerPreferencesRepository runningDinnerPreferencesRepository;
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private TeamRepository teamRepository;

  @Autowired
  private MessageService messageService;

  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private MessageJobRepository messageJobRepository;
  
  @Autowired
  private ActivityRepository activityRepository;
  
  @Autowired
  private ContractService contractService;
  
  @Autowired
  private RegistrationOrderRepository registrationOrderRepository;
  
  @Autowired
  private PaymentOptionsRepository paymentOptionsRepository;
  
  @Autowired
  private DeletedRunningDinnerRepository deletedRunningDinnerRepository;

  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Transactional
  public void deleteRunningDinner(final RunningDinner runningDinner) {
    
    DeletedRunningDinner deletedRunningDinner = saveDeletedRunningDinner(runningDinner);
    
    messageTaskRepository.deleteByAdminId(runningDinner.getAdminId());
    
    messageJobRepository.deleteByAdminId(runningDinner.getAdminId());
    
    activityRepository.deleteByAdminId(runningDinner.getAdminId());
    
    paymentOptionsRepository.deleteByAdminId(runningDinner.getAdminId());

    registrationOrderRepository.deleteByAdminId(runningDinner.getAdminId());
    
    runningDinnerPreferencesRepository.deleteByAdminId(runningDinner.getAdminId());
     
    List<Participant> participants = participantRepository.findByAdminIdOrderByParticipantNumber(runningDinner.getAdminId());
    ParticipantService.removeTeamReferences(participants);
    ParticipantService.removeTeamPartnerWishOriginatorIds(participants);
    participantRepository.saveAllAndFlush(participants);
    
    List<Team> teams = teamRepository.findByAdminId(runningDinner.getAdminId());
    Set<UUID> teamIds = teams
                          .stream()
                          .map(Team::getId)
                          .collect(Collectors.toSet());
    teams = teamRepository.findWithVisitationPlanDistinctByIdInAndAdminIdOrderByTeamNumber(teamIds, runningDinner.getAdminId());
    for (Team team : teams) {
      team.removeAllTeamReferences();
    }
    teamRepository.saveAll(teams);
    
    teamRepository.deleteByAdminId(runningDinner.getAdminId());
    
    participantRepository.deleteByAdminId(runningDinner.getAdminId());

    contractService.updateContractToDeletedDinner(runningDinner, deletedRunningDinner);

    // This removes automatically also all mealclass-entities:
    runningDinnerRepository.delete(runningDinner);
  }
  
  
  private DeletedRunningDinner saveDeletedRunningDinner(RunningDinner runningDinner) {

    DeletedRunningDinner deletedRunningDinner = new DeletedRunningDinner(runningDinner);
    DeletedRunningDinner result = deletedRunningDinnerRepository.save(deletedRunningDinner);
    LOGGER.info("Saving metadata about dinner to delete {}", runningDinner);
    return result;
  }

  @Transactional
  public void warnAboutDeletion(RunningDinner runningDinner, LocalDateTime now) {

    RunningDinnerPreferences preferences = runningDinnerService.getPreferences(runningDinner.getAdminId());
    if (isAlreadyWarnedAboutDeletion(preferences)) {
      LOGGER.info("{} was already warned about deletion", runningDinner);
      return;
    }

    LocalDateTime deletionDate = runningDinner.getDate().plusDays(DAYS_TO_KEEP_OLD_DINNER).atStartOfDay();
    if (deletionDate.isAfter(now)) {
      messageService.sendRunningDinnerDeletionWarnMessage(runningDinner, deletionDate, now);
    } else {
      LOGGER.warn("Don't send deletion warn message for {} due to deletion-date {} is before current date {}", runningDinner, deletionDate, now);
    }

    preferences.addPreference(MessageType.RUNNING_DINNER_DELETION_WARN_MESSAGE.name(), Boolean.TRUE.toString());
  }

  private boolean isAlreadyWarnedAboutDeletion(RunningDinnerPreferences preferences) {
    return preferences.getBooleanValue(MessageType.RUNNING_DINNER_DELETION_WARN_MESSAGE.name()).orElse(false);
  }

  protected LocalDateTime calculateFilterDateForDeletion(LocalDateTime now) {
    return now.minusDays(DAYS_TO_KEEP_OLD_DINNER);
  }

  protected LocalDateTime calculateFilterDateForWarn(LocalDateTime now) {

    return now.minusDays(DAYS_BEFORE_DELETION_TO_WARN);
  }
}
