package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.springframework.context.ApplicationEvent;

public class ParticipantSavedEvent extends ApplicationEvent {

  private final Participant participant;
  private final RunningDinner runningDinner;

  public ParticipantSavedEvent(Object source, Participant participant, RunningDinner runningDinner) {
    super(source);
    this.participant = participant;
    this.runningDinner = runningDinner;
  }

  public Participant getParticipant() {
    return participant;
  }

  public RunningDinner getRunningDinner() {
    return runningDinner;
  }
}
