package org.runningdinner.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;

import org.hibernate.validator.constraints.SafeHtml;

public class ReSendRunningDinnerCreatedMessage {

  @Valid
  @SafeHtml
  @Email
  private String newEmailAddress;

  public String getNewEmailAddress() {
    return newEmailAddress;
  }

  public void setNewEmailAddress(String newEmailAddress) {
    this.newEmailAddress = newEmailAddress;
  }

}
