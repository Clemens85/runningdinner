package org.runningdinner.event;

import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerInfo;
import org.springframework.context.ApplicationEvent;
import org.springframework.util.Assert;

public class RunningDinnerSettingsUpdatedEvent extends ApplicationEvent {

  private static final long serialVersionUID = 1L;
  
  private RunningDinner runningDinner;
  
  private RunningDinnerInfo oldBasicSettings;
  
  private PublicSettings oldPublicSettings;
  
  private boolean afterPartyLocationUpdate;

  public RunningDinnerSettingsUpdatedEvent(final Object source, final RunningDinner runningDinner, RunningDinnerInfo oldBasicSettings) {

    super(source);
    Assert.notNull(oldBasicSettings, "old basic settings must be passed");
    this.runningDinner = runningDinner;
    this.oldBasicSettings = oldBasicSettings;
  }
  
  public RunningDinnerSettingsUpdatedEvent(final Object source, final RunningDinner runningDinner, PublicSettings oldPublicSettings) {

    super(source);
    Assert.notNull(oldPublicSettings, "old public settings must be passed");
    this.runningDinner = runningDinner;
    this.oldPublicSettings = oldPublicSettings;
  }
  
  public RunningDinnerSettingsUpdatedEvent(final Object source, final RunningDinner runningDinner) {

    super(source);
    this.runningDinner = runningDinner;
    this.afterPartyLocationUpdate = true;
  }
  
  
  public boolean isAfterPartyLocationUpdate() {
    
    return afterPartyLocationUpdate;
  }
  
  public boolean isBasicSettingsUpdate() {
    
    return oldBasicSettings != null;
  }
  
  public boolean isPublicSettingsUpdate() {
    
    return oldPublicSettings != null && oldPublicSettings.isRegistrationDeactivated() == runningDinner.getPublicSettings().isRegistrationDeactivated();
  }

  public boolean isRegistrationActiveStatusUpdate() {
    
    return oldPublicSettings != null && oldPublicSettings.isRegistrationDeactivated() != runningDinner.getPublicSettings().isRegistrationDeactivated();
  }
  
  public RunningDinner getRunningDinner() {

    return runningDinner;
  }

}

