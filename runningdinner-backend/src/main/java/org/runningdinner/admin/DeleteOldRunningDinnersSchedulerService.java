package org.runningdinner.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import net.javacrumbs.shedlock.core.SchedulerLock;

@Service
public class DeleteOldRunningDinnersSchedulerService {

  private static Logger LOGGER = LoggerFactory.getLogger(DeleteOldRunningDinnersSchedulerService.class);
  
  @Value("${delete.runninginnder.instances.scheduler.enabled:true}")
  private boolean schedulerEnabled = true;
  
  private int daysToKeepOldDinner = 2;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private RunningDinnerDeletionService runningDinnerDeletionService;
  
  /**
   * Perform job each 12 hours
   */
  @Scheduled(fixedRate = 1000 * 60 * 60 * 12)
  @SchedulerLock(name = "triggerDeleteOldRunningDinnerInstances")
  public void triggerDeleteOldRunningDinnerInstances() {
    
    if (schedulerEnabled) {
      deleteOldRunningDinnerInstances(LocalDateTime.now());
    }
  }

  public void deleteOldRunningDinnerInstances(LocalDateTime now) {

    LocalDateTime deletionDate = calculateDateForDeletion(now);
 
    List<RunningDinner> runningDinners = runningDinnerService.findRunningDinnersWithDateBefore(deletionDate.toLocalDate());
    deleteRunningDinners(runningDinners);
    
    runningDinners = runningDinnerService.findRunningDinnersCancelledBefore(deletionDate);
    deleteRunningDinners(runningDinners);
  }

  private void deleteRunningDinners(List<RunningDinner> runningDinners) {

    for (RunningDinner runningDinner : runningDinners) {
      
      LOGGER.info("Trying to delete {}", runningDinner);
      try {
        runningDinnerDeletionService.deleteRunningDinner(runningDinner);
        LOGGER.info("{} successfully deleted", runningDinner);
      }
      catch (Exception ex) {
        LOGGER.error("Failed to delete {}", runningDinner, ex);
      }
    }
  }

  protected LocalDateTime calculateDateForDeletion(LocalDateTime now) {
    
    return now.minusDays(daysToKeepOldDinner);
  }
}
