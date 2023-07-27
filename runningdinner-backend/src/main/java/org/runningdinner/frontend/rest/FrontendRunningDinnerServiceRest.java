package org.runningdinner.frontend.rest;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import javax.validation.Valid;

import org.runningdinner.admin.RunningDinnerSessionData;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerPaymentService;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.ParticipantActivationResult;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.payment.RegistrationOrder;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/frontend/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class FrontendRunningDinnerServiceRest {

  private FrontendRunningDinnerService frontendRunningDinnerService;

  private FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService;

  public FrontendRunningDinnerServiceRest(FrontendRunningDinnerService frontendRunningDinnerService, 
                                          FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService) {
    
    this.frontendRunningDinnerService = frontendRunningDinnerService;
    this.frontendRunningDinnerPaymentService = frontendRunningDinnerPaymentService;
  }

  @GetMapping(value = "/runningdinner/{publicDinnerId}")
  public RunningDinnerPublicTO getRunningDinner(@PathVariable("publicDinnerId") String publicDinnerId, Locale locale) {

    LocalDate now = LocalDate.now();
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, now);
    return frontendRunningDinnerPaymentService.mapToRunningDinnerPublicTO(runningDinner, locale, now);
  }

  @GetMapping(value = "/runningdinner")
  public RunningDinnerPublicListTO getPublicRunningDinnerList(Locale locale) {

    LocalDate now = LocalDate.now();
    List<RunningDinner> publicRunningDinners = frontendRunningDinnerService.findPublicRunningDinners(now);
    return frontendRunningDinnerPaymentService.mapToRunningDinnerPublicListTO(publicRunningDinners, locale, now);
  }
  
  @PostMapping(value = "/runningdinner/{publicDinnerId}/register/validate", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationSummaryTO validateRegistration(@PathVariable("publicDinnerId") String publicDinnerId,
                                                    @RequestBody @Valid RegistrationDataTO registrationData,
                                                    Locale locale) {

    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, true);
    result = frontendRunningDinnerPaymentService.addRegistrationPaymentSummary(publicDinnerId, result, locale);
    return new RegistrationSummaryTO(result);
  }
  
  @PostMapping(value = "/runningdinner/{publicDinnerId}/register", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationSummaryTO performFreeRegistration(@PathVariable("publicDinnerId") String publicDinnerId,
                                                       @RequestParam(name = "validateOnly", defaultValue = "true") boolean onlyPreviewAndValidation,
                                                       @RequestBody @Valid RegistrationDataTO registrationData,
                                                       Locale locale) {

    RegistrationSummary result = frontendRunningDinnerPaymentService.performFreeRegistration(publicDinnerId, registrationData, locale);
    return new RegistrationSummaryTO(result);
  }
  
  @PostMapping(value = "/runningdinner/{publicDinnerId}/order", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationOrderTO createRegistrationOrder(@PathVariable("publicDinnerId") String publicDinnerId,
                                                     @RequestBody @Valid RegistrationDataTO registrationData) {
    
    RegistrationOrder result = frontendRunningDinnerPaymentService.createRegistrationOrder(publicDinnerId, registrationData);
    return new RegistrationOrderTO(result);
  }

  @GetMapping(value = "/runningdinner/{publicDinnerId}/order/capture")
  public RegistrationSummaryTO performRegistrationForRegistrationOrder(@PathVariable("publicDinnerId") String publicDinnerId,
                                                                       @RequestParam("token") String paypalOrderId) {
    
    RegistrationSummary registrationSummary = frontendRunningDinnerPaymentService.performRegistrationForRegistrationOrder(publicDinnerId, paypalOrderId);
    return new RegistrationSummaryTO(registrationSummary);
  }
  
  @GetMapping(value = "/runningdinner/{publicDinnerId}/order/cancel")
  public RegistrationDataTO cancelRegistrationOrder(@PathVariable("publicDinnerId") String publicDinnerId,
                                                    @RequestParam("token") String paypalOrderId) {
    
    return frontendRunningDinnerPaymentService.cancelRegistrationOrder(publicDinnerId, paypalOrderId);
  }
  
  @PutMapping(value = "/runningdinner/{publicDinnerId}/{participantId}/activate", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ParticipantActivationResult activateSubscribedParticipant(
      @PathVariable("publicDinnerId") String publicDinnerId,
      @PathVariable("participantId") UUID participantId) {

    return frontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId);
  }

  @GetMapping("/runningdinner/{publicDinnerId}/sessiondata")
  public RunningDinnerSessionData findRunningDinnerSessionData(@PathVariable("publicDinnerId") String publicDinnerId,
      Locale locale) {

    LocalDate now = LocalDate.now();
    return frontendRunningDinnerService.findRunningDinnerSessionDataByPublicId(publicDinnerId, locale, now);
  }

}
