package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.WaitingListTeamsGeneratedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class WaitingListTeamsGeneratedActivityListener implements ApplicationListener<WaitingListTeamsGeneratedEvent> {

	@Autowired
	private ActivityService activityService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	@Override
	public void onApplicationEvent(WaitingListTeamsGeneratedEvent event) {
		activityService.createActivityForWaitingListTeamsGenerated(event.getTeams(), event.getRunningDinner());
	}
}
