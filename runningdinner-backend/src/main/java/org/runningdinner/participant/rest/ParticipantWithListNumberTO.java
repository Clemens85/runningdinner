package org.runningdinner.participant.rest;

import org.runningdinner.participant.Participant;

public class ParticipantWithListNumberTO extends ParticipantTO {

  private int listNumber;

  protected ParticipantWithListNumberTO() {
  	// NOP
  }

  public ParticipantWithListNumberTO(final Participant participant, int listNumber) {
    super(participant);
    this.listNumber = listNumber;
  }

  public int getListNumber() {
    return listNumber;
  }

}
