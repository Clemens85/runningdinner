package org.runningdinner.participant;

import java.util.UUID;

import org.springframework.util.Assert;

public final class ParticipantAccessor {

  private final Participant wrappedParticipant;

  private ParticipantAccessor(final Participant wrappedParticipant) {
    this.wrappedParticipant = wrappedParticipant;
  }
  
  public ParticipantAccessor setId(UUID id) {
  	Assert.state(wrappedParticipant.isNew(), "Can only set ID for Participant if it has none set so far, but ID was " + wrappedParticipant.getId());
  	wrappedParticipant.setId(id);
    return this;
  }
  
  public static ParticipantAccessor newAccessor(Participant wrappedParticipant) {
    return new ParticipantAccessor(wrappedParticipant);
  }
}
