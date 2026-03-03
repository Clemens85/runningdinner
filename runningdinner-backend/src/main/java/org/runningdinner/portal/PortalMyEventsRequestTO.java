package org.runningdinner.portal;

import jakarta.validation.Valid;

import java.util.List;

public class PortalMyEventsRequestTO {

  @Valid
  private List<PortalCredentialTO> credentials;

  public PortalMyEventsRequestTO() {
  }

  public PortalMyEventsRequestTO(List<PortalCredentialTO> credentials) {
    this.credentials = credentials;
  }

  public List<PortalCredentialTO> getCredentials() {
    return credentials;
  }

  public void setCredentials(List<PortalCredentialTO> credentials) {
    this.credentials = credentials;
  }
}
