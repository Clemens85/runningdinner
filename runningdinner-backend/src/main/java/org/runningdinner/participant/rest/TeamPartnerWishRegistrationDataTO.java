package org.runningdinner.participant.rest;

import com.google.common.base.MoreObjects;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.participant.ParticipantName;

import java.util.Objects;

public class TeamPartnerWishRegistrationDataTO {

  @NotBlank
  @Size(max = 255)
  @SafeHtml
  private String firstnamePart;

  @NotBlank
  @SafeHtml
  @Size(max = 255)
  private String lastname;

  @Email
  @Size(max = 255)
  private String email;

  @SafeHtml
  @Size(max = 255)
  private String mobileNumber;

  protected TeamPartnerWishRegistrationDataTO() {
    // JSON
  }
  
  public TeamPartnerWishRegistrationDataTO(ParticipantName name) {
    this.firstnamePart = name.getFirstnamePart();
    this.lastname = name.getLastname();
  }

  public String getFirstnamePart() {
    return firstnamePart;
  }

  public void setFirstnamePart(String firstnamePart) {
    this.firstnamePart = firstnamePart;
  }

  public String getLastname() {
    return lastname;
  }

  public void setLastname(String lastname) {
    this.lastname = lastname;
  }

  public String getEmail() {
    return this.email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getMobileNumber() {
    return mobileNumber;
  }

  public void setMobileNumber(String mobileNumber) {
    this.mobileNumber = mobileNumber;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    TeamPartnerWishRegistrationDataTO that = (TeamPartnerWishRegistrationDataTO) o;
    return Objects.equals(firstnamePart, that.firstnamePart) && Objects.equals(lastname, that.lastname) &&
           Objects.equals(email, that.email) && Objects.equals(mobileNumber, that.mobileNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(firstnamePart, lastname, email, mobileNumber);
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("firstnamePart", firstnamePart)
      .add("lastname", lastname)
      .add("email", email)
      .toString();
  }
}
