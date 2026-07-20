package org.runningdinner.portal;

import com.google.common.base.MoreObjects;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class PortalMyEventsRequestTO {

  @NotNull
  @Size(max = 20)
  private List<@NotNull @Size(max = 128) String> portalTokens;

  public PortalMyEventsRequestTO() {
  }

  public PortalMyEventsRequestTO(List<String> portalTokens) {
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
    return MoreObjects.toStringHelper(this)
            .add("portalTokens", portalTokens)
            .toString();
  }
}
