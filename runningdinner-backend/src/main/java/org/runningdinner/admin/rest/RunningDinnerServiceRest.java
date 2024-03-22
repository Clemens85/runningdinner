package org.runningdinner.admin.rest;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import jakarta.validation.Valid;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.ReSendRunningDinnerCreatedMessage;
import org.runningdinner.admin.ReSendRunningDinnerCreatedMessageService;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.runningdinner.wizard.PublicSettingsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/rest/runningdinnerservice/v1/runningdinner", produces = MediaType.APPLICATION_JSON_VALUE)
public class RunningDinnerServiceRest {

  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;

  @Autowired
  private UrlGenerator urlGenerator;

  @Autowired
  private ReSendRunningDinnerCreatedMessageService reSendRunningDinnerCreatedMessageService;
  
  @Autowired
  private AfterPartyLocationService afterPartyLocationService;

  @GetMapping("/{adminId}")
  public RunningDinnerAdminTO getRunningDinner(@PathVariable String adminId, Locale locale) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    return mapRunningDinnerAdminTO(runningDinner, locale);
  }

  @PutMapping("/{adminId}/mealtimes")
  public RunningDinnerAdminTO updateMealTimes(@PathVariable String adminId,
      @RequestBody @Valid UpdateMealsRequestTO updateMealsList,
      Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updateMealTimes(adminId, updateMealsList.getMeals());
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
	
  @PutMapping(value = "/{adminId}/basicsettings", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RunningDinnerAdminTO updateBasicSettings(@PathVariable String adminId,
                                                  @Valid @RequestBody BasicSettingsTO basicSettings, 
                                                  Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updateBasicSettings(adminId, basicSettings);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @PutMapping(value = "/{adminId}/publicsettings", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RunningDinnerAdminTO updatePublicSettings(@PathVariable String adminId,
                                                   @Valid @RequestBody PublicSettingsTO publicSettings, 
                                                   Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updatePublicSettings(adminId, publicSettings);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @PutMapping(value = "/{adminId}/afterpartylocation", consumes = MediaType.APPLICATION_JSON_VALUE)
  public RunningDinnerAdminTO updateAfterPartyLocation(@PathVariable String adminId,
                                                       @Valid @RequestBody AfterPartyLocation afterPartyLocation, 
                                                       Locale locale) {

    RunningDinner updatedRunningDinner = afterPartyLocationService.updateAfterPartyLocation(adminId, afterPartyLocation);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @PutMapping("/{adminId}/afterpartylocation/geocode")
  public RunningDinnerAdminTO updateAfterPartyLocationGeocode(@PathVariable final String adminId, 
                                                              @RequestBody GeocodingResult geocodingResult, 
                                                              Locale locale) {

    RunningDinner updatedRunningDinner = afterPartyLocationService.updateAfterPartyLocationGeocode(adminId, geocodingResult);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @DeleteMapping(value = "/{adminId}/afterpartylocation")
  public RunningDinnerAdminTO deleteAfterPartyLocation(@PathVariable String adminId,
                                                       Locale locale) {

    RunningDinner updatedRunningDinner = afterPartyLocationService.deleteAfterPartyLocation(adminId);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @PutMapping("/{adminId}/publicsettings/registration/{enable}")
  public RunningDinnerAdminTO updateRegistrationActiveState(@PathVariable String adminId,
                                                            @PathVariable boolean enable, 
                                                            Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updateRegistrationActiveState(adminId, enable);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @PutMapping("/{adminId}/resend-runningdinner-created-message")
  public RunningDinnerAdminTO reSendRunningDinnerCreatedMessage(@PathVariable String adminId,
  																@Valid @RequestBody ReSendRunningDinnerCreatedMessage reSendRunningDinnerCreatedMesssage, 
  																Locale locale) {
 
  	RunningDinner runningDinner = reSendRunningDinnerCreatedMessageService.reSendRunningDinnerCreatedMessage(adminId, reSendRunningDinnerCreatedMesssage);
  	return mapRunningDinnerAdminTO(runningDinner, locale);
  }

  @GetMapping("/{adminId}/example/participants")
  public ResponseEntity<?> addExampleParticipants(@PathVariable String adminId) {
 
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    List<Participant> participants = ParticipantService.newParticipantsFromDemoXls();
    runningDinner = createRunningDinnerWizardService.saveParticipantsToDinner(runningDinner, participants);
    
    try {
      String url = urlGenerator.constructAdminParticipantsUrl(runningDinner.getAdminId());
      URI uri = new URL(url).toURI();
      HttpHeaders headers = new HttpHeaders();
      headers.setLocation(uri);
      return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
    } catch (MalformedURLException | URISyntaxException e) {
      throw new TechnicalException(e);
    }

  }
  
  @DeleteMapping("/{adminId}")
  public RunningDinnerAdminTO cancelRunningDinner(@PathVariable String adminId, Locale locale) {
    
    RunningDinner result = runningDinnerService.cancelRunningDinner(adminId, LocalDateTime.now());
    return mapRunningDinnerAdminTO(result, locale);
  }
	
  @PutMapping("/{adminId}/acknowledge/{acknowledgeId}")
  public RunningDinnerAdminTO acknowledgeRunningDinner(@PathVariable String adminId, @PathVariable UUID acknowledgeId, Locale locale) {
    
    RunningDinner result = runningDinnerService.acknowledgeRunningDinner(adminId, acknowledgeId, LocalDateTime.now());
    return mapRunningDinnerAdminTO(result, locale);
  }
  
  private RunningDinnerAdminTO mapRunningDinnerAdminTO(RunningDinner runningDinner, Locale locale) {
    
    RunningDinnerAdminTO result = new RunningDinnerAdminTO(runningDinner);
    result.setSessionData(runningDinnerService.calculateSessionData(runningDinner, locale));
    return result;
  }
}
