package org.runningdinner.frontend.rest;

import jakarta.validation.constraints.AssertTrue;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.Gender;
import org.runningdinner.participant.rest.ParticipantInputDataTO;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class RegistrationDataTO extends ParticipantInputDataTO {

  @AssertTrue(message = "error.invalid.dataProcessingAcknowledged")
  private boolean dataProcessingAcknowledged;
  
  @SafeHtml
  private String orderId;
  
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
  
  @JsonIgnore
  public Gender getGenderNotNull() {
    return this.getGender() != null ? this.getGender() : Gender.UNDEFINED;
  }
  
  public String getOrderId() {
    return orderId;
  }

  public void setOrderId(String orderId) {
    this.orderId = orderId;
  }

  @Override
  public String toString() {
    return super.toString();
  }

}
