package org.runningdinner.portal;

import java.util.List;

public class PortalAccessResponseTO {

  private List<PortalCredentialTO> credentials;

  public PortalAccessResponseTO() {
  }

  public PortalAccessResponseTO(List<PortalCredentialTO> credentials) {
    this.credentials = credentials;
  }

  public List<PortalCredentialTO> getCredentials() {
    return credentials;
  }

  public void setCredentials(List<PortalCredentialTO> credentials) {
    this.credentials = credentials;
  }
}
