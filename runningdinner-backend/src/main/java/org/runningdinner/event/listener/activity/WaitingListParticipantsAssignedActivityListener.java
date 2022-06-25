package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.WaitingListParticipantsAssignedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class WaitingListParticipantsAssignedActivityListener implements ApplicationListener<WaitingListParticipantsAssignedEvent> {

	@Autowired
	private ActivityService activityService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	@Override
	public void onApplicationEvent(WaitingListParticipantsAssignedEvent event) {
		activityService.createActivityForWaitingListParticipantsAssigned(event.getTeams(), event.getRunningDinner());
	}
}
