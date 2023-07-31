package org.runningdinner.admin;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.runningdinner.admin.activity.ActivityRepository;
import org.runningdinner.admin.deleted.DeletedRunningDinner;
import org.runningdinner.admin.deleted.DeletedRunningDinnerRepository;
import org.runningdinner.admin.message.job.MessageJobRepository;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.contract.ContractService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RunningDinnerDeletionService {

  private static Logger LOGGER = LoggerFactory.getLogger(RunningDinnerDeletionService.class);

  @Autowired
  private RunningDinnerRepository runningDinnerRepository;

  @Autowired
  private RunningDinnerPreferencesRepository runningDinnerPreferencesRepository;
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private TeamRepository teamRepository;
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private MessageJobRepository messageJobRepository;
  
  @Autowired
  private ActivityRepository activityRepository;
  
  @Autowired
  private ContractService contractService;
  
  @Autowired
  private DeletedRunningDinnerRepository deletedRunningDinnerRepository;
  
  @Transactional
  public void deleteRunningDinner(final RunningDinner runningDinner) {
    
    DeletedRunningDinner deletedRunningDinner = saveDeletedRunningDinner(runningDinner);
    
    messageTaskRepository.deleteByAdminId(runningDinner.getAdminId());
    
    messageJobRepository.deleteByAdminId(runningDinner.getAdminId());
    
    activityRepository.deleteByAdminId(runningDinner.getAdminId());
    
    runningDinnerPreferencesRepository.deleteByAdminId(runningDinner.getAdminId());
     
    List<Participant> participants = participantRepository.findByAdminIdOrderByParticipantNumber(runningDinner.getAdminId());
    ParticipantService.removeTeamReferences(participants);
    ParticipantService.removeTeamPartnerWishOriginatorIds(participants);
    participantRepository.saveAll(participants);
    
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
  
}
