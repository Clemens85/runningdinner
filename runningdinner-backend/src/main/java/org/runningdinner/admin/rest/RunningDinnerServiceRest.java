package org.runningdinner.admin.rest;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import javax.validation.Valid;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.runningdinner.wizard.PublicSettingsTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/runningdinnerservice/v1/runningdinner", produces = MediaType.APPLICATION_JSON_VALUE)
public class RunningDinnerServiceRest {

	@Autowired
	private RunningDinnerService runningDinnerService;
	
	@Autowired
	private CreateRunningDinnerWizardService createRunningDinnerWizardService;
	
	@Autowired
	private UrlGenerator urlGenerator;

	@RequestMapping(value = "/{adminId}", method = RequestMethod.GET)
	public RunningDinnerAdminTO getRunningDinner(@PathVariable("adminId") String adminId, Locale locale) {

		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    return mapRunningDinnerAdminTO(runningDinner, locale);
	}

	@RequestMapping(value = "/{adminId}/mealtimes", method = RequestMethod.PUT)
	public RunningDinnerAdminTO updateMealTimes(@PathVariable("adminId") String adminId, 
	                                            @RequestBody @Valid UpdateMealsRequestTO updateMealsList,
	                                            Locale locale) {

		RunningDinner updatedRunningDinner = runningDinnerService.updateMealTimes(adminId, updateMealsList.getMeals());
		return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
	}
	
  @RequestMapping(value = "/{adminId}/basicsettings", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
  public RunningDinnerAdminTO updateBasicSettings(@PathVariable("adminId") String adminId,
                                                  @Valid @RequestBody BasicSettingsTO basicSettings, 
                                                  Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updateBasicSettings(adminId, basicSettings);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @RequestMapping(value = "/{adminId}/publicsettings", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
  public RunningDinnerAdminTO updatePublicSettings(@PathVariable("adminId") String adminId,
                                                   @Valid @RequestBody PublicSettingsTO publicSettings, 
                                                   Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updatePublicSettings(adminId, publicSettings);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }
  
  @RequestMapping(value = "/{adminId}/publicsettings/registration/{enable}", method = RequestMethod.PUT)
  public RunningDinnerAdminTO updateRegistrationActiveState(@PathVariable("adminId") String adminId,
                                                            @PathVariable("enable") boolean enable, 
                                                            Locale locale) {

    RunningDinner updatedRunningDinner = runningDinnerService.updateRegistrationActiveState(adminId, enable);
    return mapRunningDinnerAdminTO(updatedRunningDinner, locale);
  }

  @RequestMapping(value = "/{adminId}/example/participants", method = RequestMethod.GET)
  public ResponseEntity<?> addExampleParticipants(@PathVariable("adminId") String adminId) {
 
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
  
  @RequestMapping(value = "/{adminId}", method = RequestMethod.DELETE)
  public RunningDinnerAdminTO cancelRunningDinner(@PathVariable("adminId") String adminId, Locale locale) {
    
    RunningDinner result = runningDinnerService.cancelRunningDinner(adminId, LocalDateTime.now());
    return mapRunningDinnerAdminTO(result, locale);
  }
	
  @RequestMapping(value = "/{adminId}/acknowledge/{acknowledgeId}", method = RequestMethod.PUT)
  public RunningDinnerAdminTO acknowledgeRunningDinner(@PathVariable("adminId") String adminId, @PathVariable("acknowledgeId") UUID acknowledgeId, Locale locale) {
    
    RunningDinner result = runningDinnerService.acknowledgeRunningDinner(adminId, acknowledgeId, LocalDateTime.now());
    return mapRunningDinnerAdminTO(result, locale);
  }
  
  private RunningDinnerAdminTO mapRunningDinnerAdminTO(RunningDinner runningDinner, Locale locale) {
    
    RunningDinnerAdminTO result = new RunningDinnerAdminTO(runningDinner);
    result.setSessionData(runningDinnerService.calculateSessionData(runningDinner, locale));
    return result;
  }
}
