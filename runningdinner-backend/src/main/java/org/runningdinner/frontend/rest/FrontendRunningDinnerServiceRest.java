package org.runningdinner.frontend.rest;

import org.runningdinner.admin.RunningDinnerSessionData;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerPaymentService;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.ParticipantActivationResult;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.payment.RegistrationOrder;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping(value = "/rest/frontend/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class FrontendRunningDinnerServiceRest {

  private final FrontendRunningDinnerService frontendRunningDinnerService;

  private final FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService;

  public FrontendRunningDinnerServiceRest(FrontendRunningDinnerService frontendRunningDinnerService, 
                                          FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService) {
    
    this.frontendRunningDinnerService = frontendRunningDinnerService;
    this.frontendRunningDinnerPaymentService = frontendRunningDinnerPaymentService;
  }

  @GetMapping(value = "/runningdinner/{publicDinnerId}")
  public RunningDinnerPublicTO getRunningDinner(@PathVariable String publicDinnerId, Locale locale) {

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
  public RegistrationSummaryTO validateRegistration(@PathVariable String publicDinnerId,
                                                    @RequestBody @Valid RegistrationDataTO registrationData,
                                                    Locale locale) {

    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, true);
    result = frontendRunningDinnerPaymentService.addRegistrationPaymentSummary(publicDinnerId, result, locale);
    return new RegistrationSummaryTO(result);
  }
  
  @PostMapping(value = "/runningdinner/{publicDinnerId}/register", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationSummaryTO performFreeRegistration(@PathVariable String publicDinnerId,
                                                       @RequestParam(name = "validateOnly", defaultValue = "true") boolean onlyPreviewAndValidation,
                                                       @RequestBody @Valid RegistrationDataTO registrationData) {

    RegistrationSummary result = frontendRunningDinnerPaymentService.performFreeRegistration(publicDinnerId, registrationData);
    return new RegistrationSummaryTO(result);
  }
  
  @PostMapping(value = "/runningdinner/{publicDinnerId}/order", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RegistrationOrderTO createRegistrationOrder(@PathVariable String publicDinnerId,
                                                     @RequestBody @Valid RegistrationDataTO registrationData) {
    
    RegistrationOrder result = frontendRunningDinnerPaymentService.createRegistrationOrder(publicDinnerId, registrationData);
    return new RegistrationOrderTO(result);
  }

  @GetMapping(value = "/runningdinner/{publicDinnerId}/order/capture")
  public RegistrationSummaryTO performRegistrationForRegistrationOrder(@PathVariable String publicDinnerId,
                                                                       @RequestParam("token") String paypalOrderId,
                                                                       Locale locale) {
    
    RegistrationSummary registrationSummary = frontendRunningDinnerPaymentService.performRegistrationForRegistrationOrder(publicDinnerId, paypalOrderId, locale);
    return new RegistrationSummaryTO(registrationSummary);
  }
  
  @GetMapping(value = "/runningdinner/{publicDinnerId}/order/cancel")
  public RegistrationDataTO cancelRegistrationOrder(@PathVariable String publicDinnerId,
                                                    @RequestParam("token") String paypalOrderId) {
    
    return frontendRunningDinnerPaymentService.cancelRegistrationOrder(publicDinnerId, paypalOrderId);
  }
  
  @PutMapping(value = "/runningdinner/{publicDinnerId}/{participantId}/activate", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ParticipantActivationResult activateSubscribedParticipant(
      @PathVariable String publicDinnerId,
      @PathVariable UUID participantId) {

    return frontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId);
  }

  @GetMapping("/runningdinner/{publicDinnerId}/sessiondata")
  public RunningDinnerSessionData findRunningDinnerSessionData(@PathVariable String publicDinnerId,
      Locale locale) {

    LocalDate now = LocalDate.now();
    return frontendRunningDinnerService.findRunningDinnerSessionDataByPublicId(publicDinnerId, locale, now);
  }

}
