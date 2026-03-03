package org.runningdinner.portal;

import java.time.LocalDate;

public class PortalEventEntryTO {

  private String eventName;
  private LocalDate eventDate;
  private String city;
  private PortalRole role;
  /** null for PARTICIPANT; full admin URL for ORGANIZER */
  private String adminUrl;

  public PortalEventEntryTO() {
  }

  public PortalEventEntryTO(String eventName, LocalDate eventDate, String city, PortalRole role, String adminUrl) {
    this.eventName = eventName;
    this.eventDate = eventDate;
    this.city = city;
    this.role = role;
    this.adminUrl = adminUrl;
  }

  public String getEventName() {
    return eventName;
  }

  public void setEventName(String eventName) {
    this.eventName = eventName;
  }

  public LocalDate getEventDate() {
    return eventDate;
  }

  public void setEventDate(LocalDate eventDate) {
    this.eventDate = eventDate;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public PortalRole getRole() {
    return role;
  }

  public void setRole(PortalRole role) {
    this.role = role;
  }

  public String getAdminUrl() {
    return adminUrl;
  }

  public void setAdminUrl(String adminUrl) {
    this.adminUrl = adminUrl;
  }
}
