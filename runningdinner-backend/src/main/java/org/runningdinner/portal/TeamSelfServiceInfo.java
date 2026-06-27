package org.runningdinner.portal;

import org.runningdinner.core.MealSpecifics;

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

  /**
   * True when the team partner was co-registered by (or alongside) the viewing participant via the
   * fixed-partner-registration mechanism ({@code teamPartnerWishRegistrationRoot/Child}).
   * In this case only name (and conditionally email) are shown; mobile and "Manage hosting" button
   * are hidden.
   */
  private boolean fixedTeamPartner;

  /**
   * Dietary restrictions and meal notes of the team partner.
   * Only populated when {@code fixedTeamPartner} is false and a partner exists.
   * Null otherwise.
   */
  private MealSpecifics teamPartnerMealSpecifics;

  private boolean teamPartnerCancelled;

  public TeamSelfServiceInfo() {
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

  public boolean isFixedTeamPartner() {
    return fixedTeamPartner;
  }

  public void setFixedTeamPartner(boolean fixedTeamPartner) {
    this.fixedTeamPartner = fixedTeamPartner;
  }

  public MealSpecifics getTeamPartnerMealSpecifics() {
    return teamPartnerMealSpecifics;
  }

  public void setTeamPartnerMealSpecifics(MealSpecifics teamPartnerMealSpecifics) {
    this.teamPartnerMealSpecifics = teamPartnerMealSpecifics;
  }

  public boolean isTeamPartnerCancelled() {
    return teamPartnerCancelled;
  }

  public void setTeamPartnerCancelled(boolean teamPartnerCancelled) {
    this.teamPartnerCancelled = teamPartnerCancelled;
  }
}

