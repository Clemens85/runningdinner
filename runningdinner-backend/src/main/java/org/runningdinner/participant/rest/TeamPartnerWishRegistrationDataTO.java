package org.runningdinner.participant.rest;

import javax.validation.constraints.NotBlank;

import com.google.common.base.MoreObjects;
import org.hibernate.validator.constraints.SafeHtml;

import java.util.Objects;

public class TeamPartnerWishRegistrationDataTO {

  @NotBlank
  @SafeHtml
  private String firstnamePart;

  @NotBlank
  @SafeHtml
  private String lastname;

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
