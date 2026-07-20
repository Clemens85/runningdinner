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

  /**
   * Full URL to the participant's personal dinner route page.
   * Non-null only when at least one DINNER_ROUTE mail has been sent AND the participant
   * is assigned to a team (so the route URL can be constructed). Null until both conditions are met.
   */
  private String dinnerRouteUrl;

  /** Full name of the participant as registered (first name first). */
  private String participantName;

  /** Email address the participant registered with. */
  private String participantEmail;

  public ParticipantSelfServiceInfoTO() {
  }

  public ParticipantSelfServiceInfoTO(TeamSelfServiceInfo teamSelfServiceInfo, String dinnerRouteUrl) {
    this.teamSelfServiceInfo = teamSelfServiceInfo;
    this.dinnerRouteUrl = dinnerRouteUrl;
  }

  /** Factory for the default "nothing available yet" response. */
  public static ParticipantSelfServiceInfoTO defaultPending() {
    return new ParticipantSelfServiceInfoTO(null, null);
  }

  public TeamSelfServiceInfo getTeamSelfServiceInfo() {
    return teamSelfServiceInfo;
  }

  public void setTeamSelfServiceInfo(TeamSelfServiceInfo teamSelfServiceInfo) {
    this.teamSelfServiceInfo = teamSelfServiceInfo;
  }

  public String getDinnerRouteUrl() {
    return dinnerRouteUrl;
  }

  public void setDinnerRouteUrl(String dinnerRouteUrl) {
    this.dinnerRouteUrl = dinnerRouteUrl;
  }

  public String getParticipantName() {
    return participantName;
  }

  public void setParticipantName(String participantName) {
    this.participantName = participantName;
  }

  public String getParticipantEmail() {
    return participantEmail;
  }

  public void setParticipantEmail(String participantEmail) {
    this.participantEmail = participantEmail;
  }
}
