package org.runningdinner.payment;

import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.frontend.rest.RegistrationDataTO;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class RegistrationDataMapper {
  
  /**
   * Use an own ObjectMapper for mapping the JSON stuff
   */
  private ObjectMapper objectMapper = new ObjectMapper();
  
  public RegistrationDataTO mapFromJson(String json) {
    try {
      return objectMapper.readValue(json, RegistrationDataTO.class);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }
  
  public String mapToJson(RegistrationDataTO registrationData) {
    try {
      ObjectWriter objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
      return objectWriter.writeValueAsString(registrationData);
    } catch (JsonProcessingException e) {
      throw new TechnicalException(e);
    }
  }
}
