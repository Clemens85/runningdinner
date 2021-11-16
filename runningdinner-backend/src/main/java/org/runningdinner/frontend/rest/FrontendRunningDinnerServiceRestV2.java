package org.runningdinner.frontend.rest;


import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;


@RestController
@RequestMapping(value = "/rest/frontend/v2", produces = MediaType.APPLICATION_JSON_VALUE)
public class FrontendRunningDinnerServiceRestV2 {

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;

  @RequestMapping(value = "/runningdinner/{publicDinnerId}/register", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationSummaryTO performRegistration(@PathVariable("publicDinnerId") String publicDinnerId,
                                                   @RequestParam(name = "validateOnly", defaultValue = "true") boolean onlyPreviewAndValidation,
                                                   @RequestBody @Valid RegistrationDataV2TO registrationData) {

    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, onlyPreviewAndValidation);
    return new RegistrationSummaryTO(result);
  }
}
