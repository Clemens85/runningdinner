package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.springframework.context.ApplicationEvent;

public class MealTimesUpdatedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 2362167628097318302L;

	private RunningDinner runningDinner;

	public MealTimesUpdatedEvent(Object source, RunningDinner runningDinner) {
		super(source);
		this.runningDinner = runningDinner;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	@Override
	public String toString() {
		return "runningDinner=" + runningDinner;
	}

}
