package org.runningdinner.participant.rest;

import java.util.Objects;

import javax.validation.constraints.NotBlank;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.participant.ParticipantName;

import com.google.common.base.MoreObjects;

public class TeamPartnerWishRegistrationDataTO {

  @NotBlank
  @SafeHtml
  private String firstnamePart;

  @NotBlank
  @SafeHtml
  private String lastname;

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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    TeamPartnerWishRegistrationDataTO that = (TeamPartnerWishRegistrationDataTO) o;
    return Objects.equals(firstnamePart, that.firstnamePart) && Objects.equals(lastname, that.lastname);
  }

  @Override
  public int hashCode() {
    return Objects.hash(firstnamePart, lastname);
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("firstnamePart", firstnamePart)
      .add("lastname", lastname)
      .toString();
  }
}
