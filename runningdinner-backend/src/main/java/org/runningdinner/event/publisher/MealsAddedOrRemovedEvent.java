package org.runningdinner.event.publisher;

import org.runningdinner.core.RunningDinner;
import org.springframework.context.ApplicationEvent;

public class MealsAddedOrRemovedEvent extends ApplicationEvent {

	private final RunningDinner runningDinner;

	private final boolean mealsAddedOrRemoved;

	public MealsAddedOrRemovedEvent(Object source, RunningDinner runningDinner, boolean mealsAddedOrRemoved) {
		super(source);
		this.runningDinner = runningDinner;
		this.mealsAddedOrRemoved = mealsAddedOrRemoved;
	}

	public RunningDinner getRunningDinner() {
		return runningDinner;
	}

	public boolean isMealsAddedOrRemoved() {
		return mealsAddedOrRemoved;
	}

	@Override
	public String toString() {
		return "runningDinner=" + runningDinner;
	}

}
