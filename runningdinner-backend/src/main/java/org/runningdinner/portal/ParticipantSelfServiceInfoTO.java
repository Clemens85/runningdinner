package org.runningdinner.portal;

/**
 * Carries participant self-service availability info for one event.
 * Returned by GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/self-service-info.
 * Fields default to "not yet available" until the respective organizer actions have been taken.
 */
public class ParticipantSelfServiceInfoTO {

  /** UUID string of the participant's team, or null when not yet assigned to a team. */
  private String teamId;

  /** True when at least one DINNER_ROUTE message has been sent to this participant. */
  private boolean dinnerRouteAvailable;

  /** True when at least one TEAM message has been sent to this participant. */
  private boolean changeTeamHostAvailable;

  public ParticipantSelfServiceInfoTO() {
  }

  public ParticipantSelfServiceInfoTO(String teamId, boolean dinnerRouteAvailable, boolean changeTeamHostAvailable) {
    this.teamId = teamId;
    this.dinnerRouteAvailable = dinnerRouteAvailable;
    this.changeTeamHostAvailable = changeTeamHostAvailable;
  }

  /** Factory for the default "nothing available yet" response. */
  public static ParticipantSelfServiceInfoTO defaultPending() {
    return new ParticipantSelfServiceInfoTO(null, false, false);
  }

  public String getTeamId() {
    return teamId;
  }

  public void setTeamId(String teamId) {
    this.teamId = teamId;
  }

  public boolean isDinnerRouteAvailable() {
    return dinnerRouteAvailable;
  }

  public void setDinnerRouteAvailable(boolean dinnerRouteAvailable) {
    this.dinnerRouteAvailable = dinnerRouteAvailable;
  }

  public boolean isChangeTeamHostAvailable() {
    return changeTeamHostAvailable;
  }

  public void setChangeTeamHostAvailable(boolean changeTeamHostAvailable) {
    this.changeTeamHostAvailable = changeTeamHostAvailable;
  }
}
