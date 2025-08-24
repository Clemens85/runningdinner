package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.event.MealsUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(5)
public class MealsUpdatedActivityListener implements ApplicationListener<MealsUpdatedEvent> {

	@Autowired
	private ActivityService activityService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	@Override
	public void onApplicationEvent(MealsUpdatedEvent event) {
		activityService.createActivityForMealTimesUpdated(event.getRunningDinner());
	}

}