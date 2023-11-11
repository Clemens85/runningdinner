package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.ParticipantNumbersSwappedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ParticipantNumbersSwappedActivityListener implements ApplicationListener<ParticipantNumbersSwappedEvent> {

  private ActivityService activityService;
  
  public ParticipantNumbersSwappedActivityListener(ActivityService activityService) {
    this.activityService = activityService;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(ParticipantNumbersSwappedEvent event) {
    activityService.createActivityForParticipantNumbersSwapped(event.getFirstParticipant(), event.getSecondParticipant(), event.getRunningDinner());
  }

}
