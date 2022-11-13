package org.runningdinner.admin;

import javax.validation.Valid;
import javax.validation.constraints.Email;

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
