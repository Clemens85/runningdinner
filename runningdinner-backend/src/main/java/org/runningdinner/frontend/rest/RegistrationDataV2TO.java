package org.runningdinner.frontend.rest;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.rest.BaseParticipantTO;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class RegistrationDataV2TO extends BaseParticipantTO {

  @AssertTrue(message = "error.invalid.dataProcessingAcknowledged")
  private boolean dataProcessingAcknowledged;

  @Min(value = 0)
  @NotNull
  private int numSeats;

  public RegistrationDataV2TO() {
    super();
    setNotes(StringUtils.EMPTY);
  }

  public boolean isDataProcessingAcknowledged() {
    return dataProcessingAcknowledged;
  }

  public void setDataProcessingAcknowledged(boolean dataProcessingAcknowledged) {
    this.dataProcessingAcknowledged = dataProcessingAcknowledged;
  }

  public int getNumSeats() {
    return numSeats;
  }

  public void setNumSeats(int numSeats) {
    this.numSeats = numSeats;
  }

  public Gender getGenderNotNull() {
    return this.getGender() != null ? this.getGender() : Gender.UNDEFINED;
  }

  public MealSpecifics getMealSpecifics() {
    return new MealSpecifics(this.isLactose(), this.isGluten(), this.isVegetarian(), this.isVegan(), this.getMealSpecificsNote());
  }

  public int getAgeNormalized() {
    if (getAge() <= 0) {
      return Participant.UNDEFINED_AGE;
    }
    return getAge();
  }
}
