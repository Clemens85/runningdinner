package org.runningdinner.portal;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Represents one credential entry — either a participant credential (PARTICIPANT role)
 * or an organizer credential (ORGANIZER role).
 * Used both inbound (POST /my-events request body) and outbound (GET /token response).
 */
public class PortalCredentialTO {

  @NotNull
  private PortalRole role;

  /** UUID — matches RunningDinner.selfAdministrationId. Only set when role=PARTICIPANT. */
  private UUID selfAdminId;

  /** UUID — Participant.id. Only set when role=PARTICIPANT. */
  private UUID participantId;

  /** RunningDinner.adminId. Only set when role=ORGANIZER. */
  private String adminId;

  public PortalCredentialTO() {
  }

  public static PortalCredentialTO forParticipant(UUID selfAdminId, UUID participantId) {
    PortalCredentialTO to = new PortalCredentialTO();
    to.role = PortalRole.PARTICIPANT;
    to.selfAdminId = selfAdminId;
    to.participantId = participantId;
    return to;
  }

  public static PortalCredentialTO forOrganizer(String adminId) {
    PortalCredentialTO to = new PortalCredentialTO();
    to.role = PortalRole.ORGANIZER;
    to.adminId = adminId;
    return to;
  }

  public PortalRole getRole() {
    return role;
  }

  public void setRole(PortalRole role) {
    this.role = role;
  }

  public UUID getSelfAdminId() {
    return selfAdminId;
  }

  public void setSelfAdminId(UUID selfAdminId) {
    this.selfAdminId = selfAdminId;
  }

  public UUID getParticipantId() {
    return participantId;
  }

  public void setParticipantId(UUID participantId) {
    this.participantId = participantId;
  }

  public String getAdminId() {
    return adminId;
  }

  public void setAdminId(String adminId) {
    this.adminId = adminId;
  }
}
