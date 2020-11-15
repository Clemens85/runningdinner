package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.RunningDinnerCancelledEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RunningDinnerCancelledActivityListener implements ApplicationListener<RunningDinnerCancelledEvent>  {

  @Autowired
  private ActivityService activityService;
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(RunningDinnerCancelledEvent event) {
    
    activityService.createActivityForCancelledRunningDinner(event.getRunningDinner());
  }

}
