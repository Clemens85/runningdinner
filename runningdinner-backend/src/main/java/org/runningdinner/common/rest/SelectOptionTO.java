
package org.runningdinner.common.rest;

import org.runningdinner.core.Gender;
import org.runningdinner.core.GenderAspect;
import org.runningdinner.core.RegistrationType;

/**
 * Simple wrapper around enumerations (that are used in select-inputs) for having additional i18n labels as displayname.
 * 
 * @author Clemens Stich
 * 
 */
public class SelectOptionTO {

  private String label;

  private String value;

  private String description;

  public SelectOptionTO(String value, String label) {

    this.label = label;
    this.value = value;
  }

  public SelectOptionTO(String value, String label, String description) {

    this.label = label;
    this.value = value;
    this.description = description;
  }

  protected SelectOptionTO() {

  }

  public static SelectOptionTO newGenderAspectOption(GenderAspect genderAspect, String label) {

    return new SelectOptionTO(genderAspect.name(), label);
  }

  public static SelectOptionTO newGenderOption(Gender gender, String label) {

    return new SelectOptionTO(gender.name(), label);
  }

  public static SelectOptionTO newRegistrationTypeOption(RegistrationType registrationType, String label, String description) {

    return new SelectOptionTO(registrationType.name(), label, description);
  }

  public String getLabel() {

    return label;
  }

  public String getValue() {

    return value;
  }

  public String getDescription() {

    return description;
  }

  @Override
  public String toString() {

    return "SelectOption [label=" + label + ", value=" + value + "]";
  }

}
