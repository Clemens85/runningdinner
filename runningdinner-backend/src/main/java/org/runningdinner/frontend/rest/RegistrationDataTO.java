package org.runningdinner.frontend.rest;

import javax.validation.constraints.AssertTrue;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.Gender;
import org.runningdinner.participant.rest.ParticipantInputDataTO;

public class RegistrationDataTO extends ParticipantInputDataTO {

  @AssertTrue(message = "error.invalid.dataProcessingAcknowledged")
  private boolean dataProcessingAcknowledged;
  
  public RegistrationDataTO() {
    super();
    setNotes(StringUtils.EMPTY);
  }

  public boolean isDataProcessingAcknowledged() {

    return dataProcessingAcknowledged;
  }

  public void setDataProcessingAcknowledged(boolean dataProcessingAcknowledged) {

    this.dataProcessingAcknowledged = dataProcessingAcknowledged;
  }
  
  public Gender getGenderNotNull() {
    return this.getGender() != null ? this.getGender() : Gender.UNDEFINED;
  }

  @Override
  public String toString() {
    return super.toString();
  }

}
