package org.runningdinner.event.listener.activity;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class NewRunningDinnerActivityListener implements ApplicationListener<NewRunningDinnerEvent>  {

	@Autowired
	private ActivityService activityService;
	
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	@Override
	public void onApplicationEvent(NewRunningDinnerEvent event) {
		RunningDinner newRunningDinner = event.getNewRunningDinner();
		activityService.createActivityForNewRunningDinner(newRunningDinner);
	}

}



