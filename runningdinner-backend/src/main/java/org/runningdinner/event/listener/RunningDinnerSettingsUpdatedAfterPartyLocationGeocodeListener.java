package org.runningdinner.event.listener;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RunningDinnerSettingsUpdatedAfterPartyLocationGeocodeListener implements ApplicationListener<RunningDinnerSettingsUpdatedEvent>  {

  @Autowired
  private AfterPartyLocationService afterPartyLocationService;
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(RunningDinnerSettingsUpdatedEvent event) {

    afterPartyLocationService.putGeocodeEventToQueue(event.getRunningDinner());
  }

}