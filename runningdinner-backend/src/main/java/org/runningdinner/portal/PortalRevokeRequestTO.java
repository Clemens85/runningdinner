package org.runningdinner.portal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class PortalRevokeRequestTO {

  @NotNull
  @Size(max = 20)
  private List<@NotNull @Size(max = 128) String> portalTokens;

  public PortalRevokeRequestTO() {
  }

  public PortalRevokeRequestTO(List<String> portalTokens) {
    this.portalTokens = portalTokens;
  }

  public List<String> getPortalTokens() {
    return portalTokens;
  }

  public void setPortalTokens(List<String> portalTokens) {
    this.portalTokens = portalTokens;
  }

  @Override
  public String toString() {
    return portalTokens != null ? portalTokens.toString() : "null";
  }
}
