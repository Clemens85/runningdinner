package org.runningdinner.portal;

import com.google.common.base.MoreObjects;

import java.time.LocalDate;
import java.util.List;

public class PortalEventEntryTO {

  private String eventName;
  private LocalDate eventDate;
  private String city;
  private List<PortalRole> roles;
  /**
   * null for PARTICIPANT; full admin URL for ORGANIZER
   */
  private String adminUrl;
  /**
   * Public event page URL, available for all roles
   */
  private String publicUrl;

  public PortalEventEntryTO() {
  }

  public PortalEventEntryTO(String eventName, LocalDate eventDate, String city, List<PortalRole> roles, String adminUrl, String publicUrl) {
    this.eventName = eventName;
    this.eventDate = eventDate;
    this.city = city;
    this.roles = roles;
    this.adminUrl = adminUrl;
    this.publicUrl = publicUrl;
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

  public List<PortalRole> getRoles() {
    return roles;
  }

  public void setRoles(List<PortalRole> roles) {
    this.roles = roles;
  }

  public String getAdminUrl() {
    return adminUrl;
  }

  public String getPublicUrl() {
    return publicUrl;
  }

  public void setPublicUrl(String publicUrl) {
    this.publicUrl = publicUrl;
  }

  public void setAdminUrl(String adminUrl) {
    this.adminUrl = adminUrl;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("eventName", eventName)
            .add("publicUrl", publicUrl)
            .add("adminUrl", adminUrl)
            .add("roles", roles)
            .toString();
  }
}

