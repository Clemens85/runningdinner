package org.runningdinner.event;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.springframework.context.ApplicationEvent;

public class ParticipantNumbersSwappedEvent extends ApplicationEvent {

  private RunningDinner runningDinner;

  private Participant firstParticipant;

  private Participant secondParticipant;

  public ParticipantNumbersSwappedEvent(Object source, Participant firstParticipant, Participant secondParticipant, RunningDinner runningDinner) {
    super(source);
    this.runningDinner = runningDinner;
    this.firstParticipant = firstParticipant;
    this.secondParticipant = secondParticipant;
  }

  public RunningDinner getRunningDinner() {
    return runningDinner;
  }

  public Participant getFirstParticipant() {
    return firstParticipant;
  }

  public Participant getSecondParticipant() {
    return secondParticipant;
  }

}
