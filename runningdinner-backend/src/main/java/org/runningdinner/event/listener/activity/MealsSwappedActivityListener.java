package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.MealsSwappedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MealsSwappedActivityListener implements ApplicationListener<MealsSwappedEvent> {

  private ActivityService activityService;

  public MealsSwappedActivityListener(ActivityService activityService) {
    this.activityService = activityService;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(MealsSwappedEvent event) {
    activityService.createActivityForMealsSwapped(event);
  }

}
