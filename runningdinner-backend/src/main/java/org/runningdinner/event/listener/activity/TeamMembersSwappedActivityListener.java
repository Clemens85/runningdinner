package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.TeamMembersSwappedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TeamMembersSwappedActivityListener implements ApplicationListener<TeamMembersSwappedEvent> {

	@Autowired
	private ActivityService activityService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	@Override
	public void onApplicationEvent(TeamMembersSwappedEvent event) {
		activityService.createActivityForTeamMembersSwapped(event.getFirstParticipant(), event.getSecondParticipant(),
				event.getAffectedParentTeams(), event.getRunningDinner());
	}

}
