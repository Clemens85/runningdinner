
package org.runningdinner.admin.message;

import java.util.UUID;

public class PreviewMessage {

  private UUID participantId;

  private String message;

  public PreviewMessage() {
  }

  public PreviewMessage(UUID participantId, String message) {
    this.participantId = participantId;
    this.message = message;
  }

  public UUID getParticipantId() {

    return participantId;
  }

  public void setParticipantId(UUID participantId) {

    this.participantId = participantId;
  }

  public String getMessage() {

    return message;
  }

  public void setMessage(String message) {

    this.message = message;
  }

  @Override
  public String toString() {

    return "participantKey=" + participantId + ", message=" + message;
  }

}
