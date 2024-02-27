package org.runningdinner.messaging.integration;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.rest.ParticipantTO;

public class ParticipantIntegrationPayload extends ParticipantTO {
  private String publicDinnerId;

  public ParticipantIntegrationPayload(Participant src, String publicDinnerId) {
    super(src);
    this.publicDinnerId = publicDinnerId;
  }

  public String getPublicDinnerId() {
    return publicDinnerId;
  }

  public void setPublicDinnerId(String publicDinnerId) {
    this.publicDinnerId = publicDinnerId;
  }


}