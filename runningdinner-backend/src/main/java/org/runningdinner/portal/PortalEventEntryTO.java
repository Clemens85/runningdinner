package org.runningdinner.portal;

import com.google.common.base.MoreObjects;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class PortalEventEntryTO {

  private String eventName;
  private LocalDate eventDate;
  private String city;
  private List<PortalRole> roles;
  /**
   * Holds for each role the credentials needed for accessing the event
   */
  private Map<PortalRole, PortalCredentialTO> credentials;

  /**
   * Public event page URL, available for all roles
   */
  private String publicUrl;

  public PortalEventEntryTO() {
  }

  public PortalEventEntryTO(String eventName,
                            LocalDate eventDate,
                            String city,
                            String publicUrl,
                            List<PortalRole> roles,
                            Map<PortalRole, PortalCredentialTO> credentials) {
    this.eventName = eventName;
    this.eventDate = eventDate;
    this.city = city;
    this.publicUrl = publicUrl;
    this.roles = roles;
    this.credentials = credentials;
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

  public String getPublicUrl() {
    return publicUrl;
  }

  public void setPublicUrl(String publicUrl) {
    this.publicUrl = publicUrl;
  }

  public Map<PortalRole, PortalCredentialTO> getCredentials() {
    return credentials;
  }

  public void setCredentials(Map<PortalRole, PortalCredentialTO> credentials) {
    this.credentials = credentials;
  }

  /** Convenience accessor — returns the admin URL from the ORGANIZER credential, or null. */
  public String getAdminUrl() {
    if (credentials == null) return null;
    PortalCredentialTO organizerCred = credentials.get(PortalRole.ORGANIZER);
    return organizerCred != null ? organizerCred.getAdminUrl() : null;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("eventName", eventName)
            .add("publicUrl", publicUrl)
            .add("roles", roles)
            .toString();
  }
}

