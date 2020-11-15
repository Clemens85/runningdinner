package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.springframework.context.ApplicationEvent;

/**
 * This event is published on every creation of a new running dinner
 * 
 * @author Clemens Stich
 * 
 */
public class NewRunningDinnerEvent extends ApplicationEvent {

	private static final long serialVersionUID = 2362167628097318302L;

	private RunningDinner newRunningDinner;

	public NewRunningDinnerEvent(final Object source, final RunningDinner newRunningDinner) {
		super(source);
		this.newRunningDinner = newRunningDinner;
	}

	public RunningDinner getNewRunningDinner() {
		return newRunningDinner;
	}

}
