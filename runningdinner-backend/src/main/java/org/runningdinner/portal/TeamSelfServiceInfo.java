package org.runningdinner.portal;

import java.time.LocalDateTime;

/**
 * Contains the team-related self-service information for a participant.
 * Only populated when the participant is assigned to a team AND at least one TEAM mail
 * was sent to all recipients (which signals the team arrangement is fixed).
 */
public class TeamSelfServiceInfo {

  /** Label of the meal this team is cooking (e.g. "Hauptgang"). */
  private String mealLabel;

  /** Time at which this team cooks / serves their meal. */
  private LocalDateTime mealTime;

  /** Full name of the team partner, null when no partner exists. */
  private String teamPartnerName;

  /** Email of the team partner, null when no partner exists. */
  private String teamPartnerEmail;

  /** Mobile number of the team partner, null/empty when not provided. */
  private String teamPartnerMobileNumber;

  /** Full name of the proposed/current host of this team. */
  private String hostName;

  /** Full URL to the self-service page where the participant can manage team hosting. */
  private String manageTeamHostingUrl;

  /** True when the viewing participant is themselves the proposed host of this team. */
  private boolean selfIsHost;

  public TeamSelfServiceInfo() {
  }

  public TeamSelfServiceInfo(String mealLabel, LocalDateTime mealTime,
                              String teamPartnerName, String teamPartnerEmail, String teamPartnerMobileNumber,
                              String hostName, String manageTeamHostingUrl, boolean selfIsHost) {
    this.mealLabel = mealLabel;
    this.mealTime = mealTime;
    this.teamPartnerName = teamPartnerName;
    this.teamPartnerEmail = teamPartnerEmail;
    this.teamPartnerMobileNumber = teamPartnerMobileNumber;
    this.hostName = hostName;
    this.manageTeamHostingUrl = manageTeamHostingUrl;
    this.selfIsHost = selfIsHost;
  }

  public String getMealLabel() {
    return mealLabel;
  }

  public void setMealLabel(String mealLabel) {
    this.mealLabel = mealLabel;
  }

  public LocalDateTime getMealTime() {
    return mealTime;
  }

  public void setMealTime(LocalDateTime mealTime) {
    this.mealTime = mealTime;
  }

  public String getTeamPartnerName() {
    return teamPartnerName;
  }

  public void setTeamPartnerName(String teamPartnerName) {
    this.teamPartnerName = teamPartnerName;
  }

  public String getTeamPartnerEmail() {
    return teamPartnerEmail;
  }

  public void setTeamPartnerEmail(String teamPartnerEmail) {
    this.teamPartnerEmail = teamPartnerEmail;
  }

  public String getTeamPartnerMobileNumber() {
    return teamPartnerMobileNumber;
  }

  public void setTeamPartnerMobileNumber(String teamPartnerMobileNumber) {
    this.teamPartnerMobileNumber = teamPartnerMobileNumber;
  }

  public String getHostName() {
    return hostName;
  }

  public void setHostName(String hostName) {
    this.hostName = hostName;
  }

  public String getManageTeamHostingUrl() {
    return manageTeamHostingUrl;
  }

  public void setManageTeamHostingUrl(String manageTeamHostingUrl) {
    this.manageTeamHostingUrl = manageTeamHostingUrl;
  }

  public boolean isSelfIsHost() {
    return selfIsHost;
  }

  public void setSelfIsHost(boolean selfIsHost) {
    this.selfIsHost = selfIsHost;
  }
}
