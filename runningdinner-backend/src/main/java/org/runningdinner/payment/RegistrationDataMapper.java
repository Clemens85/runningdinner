package org.runningdinner.payment;

import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.frontend.rest.RegistrationDataTO;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectWriter;

public class RegistrationDataMapper {
  
  /**
   * Use an own ObjectMapper for mapping the JSON stuff
   */
  private ObjectMapper objectMapper = new ObjectMapper();
  
  public RegistrationDataTO mapFromJson(String json) {
    try {
      return objectMapper.readValue(json, RegistrationDataTO.class);
    } catch (JacksonException e) {
      throw new TechnicalException(e);
    }
  }
  
  public String mapToJson(RegistrationDataTO registrationData) {
    try {
      ObjectWriter objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
      return objectWriter.writeValueAsString(registrationData);
    } catch (JacksonException e) {
      throw new TechnicalException(e);
    }
  }
}
