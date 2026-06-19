package org.runningdinner.portal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PortalMyEventsRequestTO {

  @NotBlank
  @Size(max = 128)
  private String portalToken;

  public PortalMyEventsRequestTO() {
  }

  public PortalMyEventsRequestTO(String portalToken) {
    this.portalToken = portalToken;
  }

  public String getPortalToken() {
    return portalToken;
  }

  public void setPortalToken(String portalToken) {
    this.portalToken = portalToken;
  }
}
