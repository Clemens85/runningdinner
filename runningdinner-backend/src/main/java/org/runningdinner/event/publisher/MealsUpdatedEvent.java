package org.runningdinner.event.publisher;

import org.runningdinner.core.RunningDinner;
import org.springframework.context.ApplicationEvent;

public class MealsUpdatedEvent extends ApplicationEvent {

	private final RunningDinner runningDinner;

	public MealsUpdatedEvent(Object source, RunningDinner runningDinner) {
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

