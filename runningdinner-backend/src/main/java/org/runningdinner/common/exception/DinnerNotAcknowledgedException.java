package org.runningdinner.common.exception;

import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.core.RunningDinner;

public class DinnerNotAcknowledgedException extends RuntimeException {

  private static final long serialVersionUID = 1L;
  
  private final RunningDinner runningDinner;
  
  public DinnerNotAcknowledgedException(MessageJob messageJob) {
    super("Failed to create " + messageJob + " due to dinner " + messageJob.getAdminId() + " is not yet acknowledged");
    this.runningDinner = messageJob.getRunningDinner();
  }

  public RunningDinner getRunningDinner() {
  
    return runningDinner;
  }
}
