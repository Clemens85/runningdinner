
package org.runningdinner.admin.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.runningdinner.wizard.BasicDetailsTO;

public class BasicSettingsTO {

  @Valid
  @NotNull
  private BasicDetailsTO basicDetails;

  private boolean teamPartnerWishDisabled;

  public BasicDetailsTO getBasicDetails() {

    return basicDetails;
  }

  public void setBasicDetails(BasicDetailsTO basicDetails) {

    this.basicDetails = basicDetails;
  }

  public boolean isTeamPartnerWishDisabled() {

    return teamPartnerWishDisabled;
  }

  public void setTeamPartnerWishDisabled(boolean teamPartnerWishDisabled) {

    this.teamPartnerWishDisabled = teamPartnerWishDisabled;
  }

}
