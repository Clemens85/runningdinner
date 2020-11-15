package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.springframework.context.ApplicationEvent;

public class RunningDinnerCancelledEvent extends ApplicationEvent {

  private static final long serialVersionUID = 1L;
  
  private RunningDinner runningDinner;

  public RunningDinnerCancelledEvent(final Object source, final RunningDinner runningDinner) {

    super(source);
    this.runningDinner = runningDinner;
  }

  public RunningDinner getRunningDinner() {

    return runningDinner;
  }
}
