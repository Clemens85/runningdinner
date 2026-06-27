package org.runningdinner.portal;

/**
 * Carries participant self-service availability info for one event.
 * Returned by GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/self-service-info.
 * Fields default to "not yet available" until the respective organizer actions have been taken.
 */
public class ParticipantSelfServiceInfoTO {

  /**
   * Team self-service info, only populated when the participant is assigned to a team AND
   * at least one TEAM mail was sent to all recipients (signalling the team arrangement is fixed).
   * Null until those conditions are met.
   */
  private TeamSelfServiceInfo teamSelfServiceInfo;

  /** True when at least one DINNER_ROUTE message has been sent to this participant. */
  private boolean dinnerRouteAvailable;

  public ParticipantSelfServiceInfoTO() {
  }

  public ParticipantSelfServiceInfoTO(TeamSelfServiceInfo teamSelfServiceInfo, boolean dinnerRouteAvailable) {
    this.teamSelfServiceInfo = teamSelfServiceInfo;
    this.dinnerRouteAvailable = dinnerRouteAvailable;
  }

  /** Factory for the default "nothing available yet" response. */
  public static ParticipantSelfServiceInfoTO defaultPending() {
    return new ParticipantSelfServiceInfoTO(null, false);
  }

  public TeamSelfServiceInfo getTeamSelfServiceInfo() {
    return teamSelfServiceInfo;
  }

  public void setTeamSelfServiceInfo(TeamSelfServiceInfo teamSelfServiceInfo) {
    this.teamSelfServiceInfo = teamSelfServiceInfo;
  }

  public boolean isDinnerRouteAvailable() {
    return dinnerRouteAvailable;
  }

  public void setDinnerRouteAvailable(boolean dinnerRouteAvailable) {
    this.dinnerRouteAvailable = dinnerRouteAvailable;
  }
}
