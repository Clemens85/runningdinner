package org.runningdinner.admin;

import net.javacrumbs.shedlock.core.SchedulerLock;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.core.util.DateTimeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeleteOldRunningDinnersSchedulerService {

  private static final Logger LOGGER = LoggerFactory.getLogger(DeleteOldRunningDinnersSchedulerService.class);
  
  private final boolean schedulerEnabled;

  private final RunningDinnerService runningDinnerService;
  
  private final RunningDinnerDeletionService runningDinnerDeletionService;

  public DeleteOldRunningDinnersSchedulerService(RunningDinnerService runningDinnerService,
                                                 RunningDinnerDeletionService runningDinnerDeletionService,
                                                 @Value("${delete.runninginnder.instances.scheduler.enabled:true}") boolean schedulerEnabled) {
    this.runningDinnerService = runningDinnerService;
    this.runningDinnerDeletionService = runningDinnerDeletionService;
    this.schedulerEnabled = schedulerEnabled;
  }

  /**
   * Perform job each 12 hours
   */
  @Scheduled(fixedRate = 1000 * 60 * 60 * 12)
  @SchedulerLock(name = "triggerDeleteOldRunningDinnerInstances")
  public void triggerDeleteOrWarnOldRunningDinnerInstances() {

    if (!schedulerEnabled) {
      LOGGER.warn("triggerDeleteOrWarnOldRunningDinnerInstances scheduler is disabled!");
      return;
    }

    try {
      warnAboutDeletion(LocalDateTime.now());
    } catch (RuntimeException e) {
      LOGGER.error("warnAboutDeletion failed unexpectedly", e);
    }

    try {
      deleteOldRunningDinnerInstances(LocalDateTime.now());
    } catch (RuntimeException e) {
      LOGGER.error("deleteOldRunningDinnerInstances failed unexpectedly", e);
    }
  }

  public void deleteOldRunningDinnerInstances(LocalDateTime now) {

    LocalDateTime deletionDate = runningDinnerDeletionService.calculateFilterDateForDeletion(now);

    List<RunningDinner> runningDinners = runningDinnerService.findRunningDinnersWithDateBefore(deletionDate.toLocalDate());
    deleteRunningDinners(runningDinners);
    
    runningDinners = runningDinnerService.findRunningDinnersCancelledBefore(deletionDate);
    deleteRunningDinners(runningDinners);
  }

  public void warnAboutDeletion(LocalDateTime now) {

    LocalDateTime warnDate = runningDinnerDeletionService.calculateFilterDateForWarn(now);

    List<RunningDinner> runningDinners = runningDinnerService.findRunningDinnersWithDateBefore(warnDate.toLocalDate());
    warnAboutDeletion(runningDinners, now);

    runningDinners = runningDinnerService.findRunningDinnersCancelledBefore(warnDate);
    warnAboutDeletion(runningDinners, now);
  }

  private void warnAboutDeletion(List<RunningDinner> runningDinners, LocalDateTime now) {

    for (RunningDinner runningDinner : runningDinners) {

      LOGGER.info("Warning about deletion for {} with date {} and cancel-date {}", runningDinner, getFormattedDinnerDate(runningDinner), runningDinner.getCancellationDate());
      try {
        runningDinnerDeletionService.warnAboutDeletion(runningDinner, now);
      } catch (Exception ex) {
        LOGGER.error("Failed to warn about deletion for  {}", runningDinner, ex);
      }
    }
  }

  private void deleteRunningDinners(List<RunningDinner> runningDinners) {

    for (RunningDinner runningDinner : runningDinners) {
      
      LOGGER.info("Trying to delete {}", runningDinner);
      try {
        runningDinnerDeletionService.deleteRunningDinner(runningDinner);
        LOGGER.info("{} successfully deleted with dinner-date {} and cancel-date {}", runningDinner, getFormattedDinnerDate(runningDinner), runningDinner.getCancellationDate());
      } catch (Exception ex) {
        LOGGER.error("Failed to delete {}", runningDinner, ex);
      }
    }
  }

  private String getFormattedDinnerDate(RunningDinner runningDinner) {
    return DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), CoreUtil.getDefaultLocale().getLanguage());
  }

}
