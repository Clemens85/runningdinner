package org.runningdinner.portal;

import java.util.UUID;

/**
 * Request body for POST /token/{portalToken}/confirm.
 * All fields are optional — only the fields relevant to the confirmation type need to be set.
 */
public class PortalConfirmRequestTO {

  /** Public dinner ID — required for participant confirmation (together with confirmParticipantId). */
  private String confirmPublicDinnerId;

  /** Participant UUID — required for participant confirmation (together with confirmPublicDinnerId). */
  private UUID confirmParticipantId;

  /** Admin ID — required for organizer confirmation. */
  private String confirmAdminId;

  public PortalConfirmRequestTO() {
  }

  public String getConfirmPublicDinnerId() {
    return confirmPublicDinnerId;
  }

  public void setConfirmPublicDinnerId(String confirmPublicDinnerId) {
    this.confirmPublicDinnerId = confirmPublicDinnerId;
  }

  public UUID getConfirmParticipantId() {
    return confirmParticipantId;
  }

  public void setConfirmParticipantId(UUID confirmParticipantId) {
    this.confirmParticipantId = confirmParticipantId;
  }

  public String getConfirmAdminId() {
    return confirmAdminId;
  }

  public void setConfirmAdminId(String confirmAdminId) {
    this.confirmAdminId = confirmAdminId;
  }
}
