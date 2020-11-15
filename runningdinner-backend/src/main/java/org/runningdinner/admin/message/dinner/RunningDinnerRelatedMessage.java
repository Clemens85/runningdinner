package org.runningdinner.admin.message.dinner;

import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.core.RunningDinner;

public class RunningDinnerRelatedMessage extends BaseMessage {

  private static final long serialVersionUID = 1L;
  
  private RunningDinner runningDinner;
  
  public RunningDinnerRelatedMessage(String subject, String message, RunningDinner runningDinner) {

    this.setMessage(message);
    this.setSubject(subject);
    this.runningDinner = runningDinner;
  }

  public RunningDinner getRunningDinner() {
  
    return runningDinner;
  }
}
