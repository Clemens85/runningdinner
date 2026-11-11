package org.runningdinner.event.listener;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.TeamNameChangedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TeamNameChangedListener implements ApplicationListener<TeamNameChangedEvent> {

  @Autowired
  private ActivityService activityService;

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(TeamNameChangedEvent event) {

    activityService.createActivityForTeamNameChanged(event.getTeam(), event.getRunningDinner(), event.getExecutingParticipant());
  }
}
