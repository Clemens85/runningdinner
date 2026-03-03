package org.runningdinner.portal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.SafeHtml;

public class AccessRecoveryRequestTO {

  @NotBlank
  @Email
  @SafeHtml
  @Size(max = 255)
  private String email;

  public AccessRecoveryRequestTO() {
  }

  public AccessRecoveryRequestTO(String email) {
    this.email = email;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}
